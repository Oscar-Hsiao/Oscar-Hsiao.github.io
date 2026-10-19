// ═════════════════════════════════════════════════
// 教育訓練與證照管理系統｜雲端後端（Google Sheets 版）
//
// 一次性設定（只要做一次）：
//   1. 到 https://script.google.com 新增專案，貼上本檔內容
//   2. 在編輯器上方函式選單選「初始化」→ 執行 → 授權
//      → 會自動建立試算表「教育訓練系統資料庫」，並產生一組存取密碼
//      → 到「執行記錄」複製那組密碼（只會顯示這一次，請存進密碼管理員）
//   3. 右上「部署」→「新增部署作業」→ 類型選「網頁應用程式」
//      執行身分：我　／　存取權：所有人（沒有密碼一樣讀不到資料）
//   4. 複製「網頁應用程式網址」，到網頁的「⚙ 雲端同步設定」貼上網址與存取密碼
//
// 資料與金鑰都只存在你的 Google 帳號：
//   試算表 ID、存取密碼 → 指令碼屬性（專案設定 → 指令碼屬性），不寫進程式碼
//
// 試算表分頁：人員／證照紀錄／證照需求／設定。網頁每次存檔會用「整份快照」覆蓋這四個分頁，
// 所以請不要直接在試算表裡改資料（要改請在網頁上改）；試算表主要用來備份與用 Excel 檢視。
// 另有版本號：兩台裝置同時改時，後存的那台會被擋下並提示先載入雲端最新版，避免互相蓋掉。
// ═════════════════════════════════════════════════

const TABLES = {
  staff:   { name: '人員',     headers: ['id', 'no', 'name', 'div', 'dept', 'title'] },
  records: { name: '證照紀錄', headers: ['id', 'staffId', 'certId', 'certName', 'certDate', 'hours', 'lastRefresh', 'cycle'] },
  certs:   { name: '證照需求', headers: ['id', 'name', 'cycle', 'initHours', 'refreshHours', 'required', 'note'] }
};
const META_SHEET = '設定';
const NUMERIC_COLS = { hours: 1, cycle: 1, initHours: 1, refreshHours: 1, required: 1 };
const DATE_COLS = { certDate: 1, lastRefresh: 1 };
const EXTRA_COL = '_extra';          // 前端有、但上面沒列到的欄位，存成 JSON，確保不遺失
const LIMITS = { staff: 5000, records: 20000, certs: 500, meta: 100, cell: 5000 };

function 初始化() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SHEET_ID')) {
    const ss = SpreadsheetApp.create('教育訓練系統資料庫');
    props.setProperty('SHEET_ID', ss.getId());
    Logger.log('已建立試算表：' + ss.getUrl());
  }
  Object.keys(TABLES).forEach(k => getSheet_(TABLES[k]));
  getMetaSheet_();
  if (!props.getProperty('API_TOKEN')) {
    const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    props.setProperty('API_TOKEN', token);
    Logger.log('存取密碼（只顯示這一次，請存進密碼管理員）：' + token);
  } else {
    Logger.log('存取密碼已存在，不再重新產生。要換密碼請執行「重設存取密碼」。');
  }
}

function 重設存取密碼() {
  const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty('API_TOKEN', token);
  Logger.log('新的存取密碼（舊的立刻失效）：' + token);
}

function ss_() {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) throw new Error('尚未初始化，請先執行「初始化」');
  return SpreadsheetApp.openById(id);
}

function getSheet_(tbl) {
  const ss = ss_();
  const headers = tbl.headers.concat([EXTRA_COL]);
  let sh = ss.getSheetByName(tbl.name);
  if (!sh) {
    sh = ss.insertSheet(tbl.name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function getMetaSheet_() {
  const ss = ss_();
  let sh = ss.getSheetByName(META_SHEET);
  if (!sh) {
    sh = ss.insertSheet(META_SHEET);
    sh.getRange(1, 1, 1, 2).setValues([['key', 'value']]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function respond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// 固定時間比較，避免從回應時間猜出密碼
function safeEqual_(a, b) {
  a = String(a || ''); b = String(b || '');
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function doGet() {
  return respond_({ ok: true, service: '教育訓練後端' }); // 不回任何資料
}

function doPost(e) {
  try {
    const p = JSON.parse(e.postData.contents);
    const token = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
    if (!token || !safeEqual_(p.token, token)) return respond_({ ok: false, error: 'Unauthorized' });
    if (p.action === 'ping') return respond_({ ok: true });
    if (p.action === 'load') return respond_(Object.assign({ ok: true }, loadAll_()));
    if (p.action === 'save') return respond_(saveAll_(p.data, p.expected_version));
    return respond_({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return respond_({ ok: false, error: String(err.message || err) });
  }
}

// ── 讀取 ─────────────────────────────────────────
function cellOut_(h, v) {
  if (v instanceof Date) v = Utilities.formatDate(v, 'Asia/Taipei', 'yyyy-MM-dd');
  if (NUMERIC_COLS[h] && v !== '' && v !== null) { const n = Number(v); return isNaN(n) ? 0 : n; }
  return v === null || v === undefined ? '' : v;
}

function readTable_(tbl) {
  const sh = getSheet_(tbl);
  const headers = tbl.headers.concat([EXTRA_COL]);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const rows = sh.getRange(2, 1, last - 1, headers.length).getValues();
  return rows.filter(r => String(r[0]) !== '').map(r => {
    const o = {};
    tbl.headers.forEach((h, i) => { o[h] = cellOut_(h, r[i]); });
    const extra = r[headers.length - 1];
    if (extra) { try { Object.assign(o, JSON.parse(extra)); } catch (_) { /* 損毀的備援欄位直接略過 */ } }
    return o;
  });
}

function readMeta_() {
  const sh = getMetaSheet_();
  const last = sh.getLastRow();
  const meta = {};
  if (last < 2) return meta;
  sh.getRange(2, 1, last - 1, 2).getValues().forEach(r => {
    if (!r[0]) return;
    try { meta[r[0]] = JSON.parse(r[1]); } catch (_) { meta[r[0]] = r[1]; }
  });
  return meta;
}

function loadAll_() {
  return {
    staff: readTable_(TABLES.staff),
    records: readTable_(TABLES.records),
    certs: readTable_(TABLES.certs),
    meta: readMeta_(),
    version: Number(PropertiesService.getScriptProperties().getProperty('DATA_VERSION') || 0)
  };
}

// ── 寫入（整份快照）──────────────────────────────
function cellIn_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') v = JSON.stringify(v);
  return String(v).slice(0, LIMITS.cell);
}

function writeTable_(tbl, items) {
  const sh = getSheet_(tbl);
  const headers = tbl.headers.concat([EXTRA_COL]);
  const cols = headers.length;
  const maxRows = sh.getMaxRows();
  if (maxRows > 1) sh.getRange(2, 1, maxRows - 1, cols).clearContent();
  if (!items.length) return;
  const rows = items.map(o => {
    const extras = {};
    Object.keys(o).forEach(k => { if (tbl.headers.indexOf(k) < 0) extras[k] = o[k]; });
    const row = tbl.headers.map(h => cellIn_(o[h]));
    row.push(Object.keys(extras).length ? cellIn_(extras) : '');
    return row;
  });
  if (maxRows < rows.length + 1) sh.insertRowsAfter(maxRows, rows.length + 1 - maxRows);
  // 全部設成純文字格式：避免試算表把日期、=開頭的字串自動轉換（也擋掉公式注入）
  const range = sh.getRange(2, 1, rows.length, cols);
  range.setNumberFormat('@');
  range.setValues(rows);
}

function writeMeta_(meta) {
  const sh = getMetaSheet_();
  const maxRows = sh.getMaxRows();
  if (maxRows > 1) sh.getRange(2, 1, maxRows - 1, 2).clearContent();
  const keys = Object.keys(meta);
  if (!keys.length) return;
  const rows = keys.map(k => [cellIn_(k), cellIn_(typeof meta[k] === 'object' ? JSON.stringify(meta[k]) : meta[k])]);
  if (maxRows < rows.length + 1) sh.insertRowsAfter(maxRows, rows.length + 1 - maxRows);
  const range = sh.getRange(2, 1, rows.length, 2);
  range.setNumberFormat('@');
  range.setValues(rows);
}

function validArray_(v, max, name) {
  if (!Array.isArray(v)) throw new Error(name + ' 必須是陣列');
  if (v.length > max) throw new Error(name + ' 筆數超過上限 ' + max);
  v.forEach(o => { if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error(name + ' 內容格式錯誤'); });
  return v;
}

function saveAll_(data, expectedVersion) {
  if (!data || typeof data !== 'object') throw new Error('Invalid payload');
  const staff = validArray_(data.staff, LIMITS.staff, 'staff');
  const records = validArray_(data.records, LIMITS.records, 'records');
  const certs = validArray_(data.certs, LIMITS.certs, 'certs');
  const meta = data.meta && typeof data.meta === 'object' && !Array.isArray(data.meta) ? data.meta : {};
  if (Object.keys(meta).length > LIMITS.meta) throw new Error('meta 項目過多');

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const props = PropertiesService.getScriptProperties();
    const cur = Number(props.getProperty('DATA_VERSION') || 0);
    // 只有「前端明確帶了版本號」才檢查；版本不同＝別台裝置已經存過，不能蓋掉
    if (expectedVersion !== undefined && expectedVersion !== null && Number(expectedVersion) !== cur) {
      return { ok: false, error: 'conflict', server_version: cur };
    }
    writeTable_(TABLES.staff, staff);
    writeTable_(TABLES.records, records);
    writeTable_(TABLES.certs, certs);
    writeMeta_(meta);
    const next = cur + 1;
    props.setProperty('DATA_VERSION', String(next));
    return { ok: true, version: next, saved: { staff: staff.length, records: records.length, certs: certs.length } };
  } finally {
    lock.releaseLock();
  }
}

// 部署前自我檢查：在編輯器執行「測試後端」，看執行記錄
function 測試後端() {
  const r1 = JSON.parse(doPost({ postData: { contents: JSON.stringify({ action: 'ping', token: 'wrong' }) } }).getContent());
  Logger.log('錯誤密碼應被拒絕：' + JSON.stringify(r1));
  const token = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
  const r2 = JSON.parse(doPost({ postData: { contents: JSON.stringify({ action: 'ping', token: token }) } }).getContent());
  Logger.log('正確密碼應通過：' + JSON.stringify(r2));
}
