// ═══════════════════════════════════════════════════════
// 法規登記系統｜雲端後端（Google Sheets 版，取代 Supabase）
//
// 一次性設定（只要做一次）：
//   1. 到 https://script.google.com 新增專案，貼上本檔內容
//   2. 在編輯器上方函式選單選「初始化」→ 執行 → 授權
//      → 會自動建立試算表「法規登記系統資料庫」，並產生一組存取密碼
//      → 到「執行記錄」複製那組密碼（只會顯示這一次，請存進密碼管理員）
//   3. 右上「部署」→「新增部署作業」→ 類型選「網頁應用程式」
//      執行身分：我　／　存取權：所有人（沒有密碼一樣讀不到資料）
//   4. 複製「網頁應用程式網址」，貼到「法規登記系統.html」的 SYNC_URL
//
// 資料與金鑰都只存在你的 Google 帳號：
//   試算表 ID、存取密碼 → 指令碼屬性（專案設定 → 指令碼屬性），不寫進程式碼
// ═══════════════════════════════════════════════════════

const SHEET_NAME = 'law_records';
const HEADERS = ['company_id','category','law_code','law_name','pub_date','mod_date',
                 'applicable','industry','status','reason','review_date','next_review','updated_at'];

function 初始化() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SHEET_ID')) {
    const ss = SpreadsheetApp.create('法規登記系統資料庫');
    props.setProperty('SHEET_ID', ss.getId());
    Logger.log('已建立試算表：' + ss.getUrl());
  }
  getSheet_();
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

function getSheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  const ss = SpreadsheetApp.openById(id);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
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
  return respond_({ ok: true, service: '法規登記後端' }); // 不回任何資料
}

function doPost(e) {
  try {
    const p = JSON.parse(e.postData.contents);
    const token = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
    if (!token || !safeEqual_(p.token, token)) return respond_({ ok: false, error: 'Unauthorized' });
    if (p.action === 'ping') return respond_({ ok: true });
    if (!p.company_id) return respond_({ ok: false, error: 'Invalid payload' });
    if (p.action === 'load') return respond_({ ok: true, records: loadRecords_(p.company_id) });
    if (p.action === 'save') {
      if (!p.records || !p.records.length) return respond_({ ok: false, error: 'Invalid payload' });
      return respond_({ ok: true, saved: saveRecords_(p.company_id, p.records) });
    }
    return respond_({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return respond_({ ok: false, error: String(err.message || err) });
  }
}

function loadRecords_(companyId) {
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  const rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  return rows.filter(r => r[0] === companyId).map(r => {
    const o = {};
    HEADERS.forEach((h, i) => {
      let v = r[i];
      if (v instanceof Date) v = Utilities.formatDate(v, 'Asia/Taipei', 'yyyy-MM-dd');
      o[h] = (v === '' ? null : v);
    });
    o.industry = o.industry ? String(o.industry).split(',').filter(Boolean) : [];
    return o;
  });
}

function saveRecords_(companyId, records) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = getSheet_();
    const last = sh.getLastRow();
    const existing = last >= 2 ? sh.getRange(2, 1, last - 1, HEADERS.length).getValues() : [];
    const index = {};
    existing.forEach((r, i) => { index[r[0] + '|' + r[1] + '|' + r[2]] = i; });
    const toRow = r => HEADERS.map(h => {
      if (h === 'company_id') return companyId;
      if (h === 'industry') return (r.industry || []).join(',');
      if (h === 'updated_at') return new Date().toISOString();
      const v = r[h];
      return (v === undefined || v === null) ? '' : v;
    });
    const appendRows = [];
    records.forEach(r => {
      const key = companyId + '|' + (r.category || '') + '|' + (r.law_code || '');
      const row = toRow(r);
      if (key in index) existing[index[key]] = row;
      else { appendRows.push(row); index[key] = existing.length + appendRows.length - 1; }
    });
    if (existing.length) sh.getRange(2, 1, existing.length, HEADERS.length).setValues(existing);
    if (appendRows.length) {
      const need = sh.getLastRow() + appendRows.length;   // 試算表預設只有 1000 列，不夠就自動加列
      if (sh.getMaxRows() < need) sh.insertRowsAfter(sh.getMaxRows(), need - sh.getMaxRows());
      sh.getRange(sh.getLastRow() + 1, 1, appendRows.length, HEADERS.length).setValues(appendRows);
    }
    return records.length;
  } finally {
    lock.releaseLock();
  }
}

// 部署後可在編輯器執行，確認讀寫正常（不會動到真實資料以外的內容）
function 自我測試() {
  const sh = getSheet_();
  Logger.log('試算表可讀寫，目前資料列數：' + Math.max(0, sh.getLastRow() - 1));
}
