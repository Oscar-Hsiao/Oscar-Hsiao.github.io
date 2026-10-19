// ════════════════════════════════════════════════════
// 溫室氣體盤查系統｜雲端後端（Google Sheets + Drive + Claude 帳單辨識）
//
// 一次性設定（只要做一次）：
//   1. 到 https://script.google.com 新增專案，貼上本檔內容
//   2. 左邊「專案設定」→「指令碼屬性」新增一筆（二選一，兩個都有時優先用 Gemini）：
//        名稱 GEMINI_API_KEY　　值 Google AI Studio 的金鑰
//        名稱 ANTHROPIC_API_KEY　值 Anthropic 金鑰（sk-ant-...）
//      （金鑰只存在你的 Google 帳號，不會出現在網頁或程式碼裡）
//   3. 在編輯器上方函式選單選「初始化」→ 執行 → 授權
//      → 自動建立試算表「溫室氣體盤查資料庫」、Drive 資料夾「GHG帳單佐證」，
//        並產生存取密碼（到「執行記錄」複製，只顯示這一次，存進密碼管理員）
//   4. 右上「部署」→「新增部署作業」→ 類型選「網頁應用程式」
//      執行身分：我　／　存取權：所有人（沒有密碼一樣讀不到、寫不進）
//   5. 複製「網頁應用程式網址」，到盤查系統「帳單掃描」頁的「雲端設定」貼上網址與密碼
//
// 資料表：
//   records  每月每筆活動數據（電、冷媒、燃料、化糞池、水費），整份 REC 攤成一列一筆
//   coeff    排放係數（每家公司一列 JSON）
//   bills    帳單辨識紀錄（只放資料與 Drive 連結，圖片本體在 Drive）
// ════════════════════════════════════════════════════

const SHEETS = {
  records: ['company_id', 'year', 'month', 'category', 'item_id', 'site', 'emission', 'data_json', 'updated_at'],
  coeff:   ['company_id', 'data_json', 'updated_at'],
  bills:   ['company_id', 'bill_id', 'file_name', 'bill_type', 'site', 'meter', 'start_date', 'end_date',
            'usage', 'amount', 'drive_url', 'status', 'created_at']
};
const CATEGORIES = ['electricity', 'refrigerant', 'fuel', 'septicTank', 'water'];
const DEFAULT_MODEL = 'claude-sonnet-5-5';
const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';
const BACKEND_VERSION = 'v4-2026-10-11'; // 連線時前端會顯示，用來確認部署的是不是最新版
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 單檔上限 10MB

function 初始化() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SHEET_ID')) {
    const ss = SpreadsheetApp.create('溫室氣體盤查資料庫');
    props.setProperty('SHEET_ID', ss.getId());
    Logger.log('已建立試算表：' + ss.getUrl());
  }
  Object.keys(SHEETS).forEach(getSheet_);
  if (!props.getProperty('DRIVE_FOLDER_ID')) {
    try {
      const folder = DriveApp.createFolder('GHG帳單佐證');
      props.setProperty('DRIVE_FOLDER_ID', folder.getId());
      Logger.log('已建立 Drive 資料夾：' + folder.getUrl());
    } catch (e) {
      Logger.log('⚠️ Drive 資料夾建立失敗（不影響其他功能，只是帳單原圖不會存佐證）：' + e.message);
    }
  }
  if (!props.getProperty('API_TOKEN')) {
    const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    props.setProperty('API_TOKEN', token);
    Logger.log('存取密碼（只顯示這一次，請存進密碼管理員）：' + token);
  } else {
    Logger.log('存取密碼已存在，不再重新產生。要換密碼請執行「重設存取密碼」。');
  }
  if (!props.getProperty('GEMINI_API_KEY') && !props.getProperty('ANTHROPIC_API_KEY')) {
    Logger.log('⚠️ 尚未設定 GEMINI_API_KEY 或 ANTHROPIC_API_KEY（專案設定 → 指令碼屬性），帳單辨識功能暫時無法使用。');
  }
}

function 重設存取密碼() {
  const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty('API_TOKEN', token);
  Logger.log('新的存取密碼（舊的立刻失效）：' + token);
}

function getSheet_(name) {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  const ss = SpreadsheetApp.openById(id);
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, SHEETS[name].length).setValues([SHEETS[name]]).setFontWeight('bold');
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
  return respond_({ ok: true, service: '溫室氣體盤查後端' }); // 不回任何資料
}

function doPost(e) {
  try {
    const p = JSON.parse(e.postData.contents);
    const token = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
    if (!token || !safeEqual_(p.token, token)) return respond_({ ok: false, error: 'Unauthorized' });
    if (p.action === 'ping') return respond_({ ok: true, hasApiKey: hasVisionKey_(), version: BACKEND_VERSION });
    if (!p.company_id) return respond_({ ok: false, error: 'Invalid payload' });

    // 同一家公司同時寫入時排隊，避免兩個人互相蓋掉
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      if (p.action === 'load')       return respond_({ ok: true, rec: loadRec_(p.company_id), coeff: loadCoeff_(p.company_id) });
      if (p.action === 'saveRec')    return respond_({ ok: true, saved: saveRec_(p.company_id, p.rec) });
      if (p.action === 'saveCoeff')  return respond_({ ok: true, saved: saveCoeff_(p.company_id, p.coeff) });
      if (p.action === 'scanBill')   return respond_({ ok: true, result: scanBill_(p.company_id, p) });
      if (p.action === 'listBills')  return respond_({ ok: true, bills: listBills_(p.company_id) });
    } finally {
      lock.releaseLock();
    }
    return respond_({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return respond_({ ok: false, error: String(err.message || err) });
  }
}

// ── 活動數據（REC：{年:{月:{electricity:[],refrigerant:[],...}}}）────────

function loadRec_(companyId) {
  const sh = getSheet_('records');
  const last = sh.getLastRow();
  if (last < 2) return null; // null＝雲端還沒有資料，前端保留本機資料
  const rows = sh.getRange(2, 1, last - 1, SHEETS.records.length).getValues();
  const rec = {};
  let n = 0;
  rows.forEach(r => {
    if (r[0] !== companyId) return;
    const yr = String(r[1]), mo = String(r[2]), cat = r[3];
    if (!rec[yr]) rec[yr] = {};
    if (!rec[yr][mo]) rec[yr][mo] = { electricity: [], refrigerant: [], fuel: [], septicTank: [] };
    if (!rec[yr][mo][cat]) rec[yr][mo][cat] = [];
    rec[yr][mo][cat].push(JSON.parse(r[7]));
    n++;
  });
  return n ? rec : null;
}

function saveRec_(companyId, rec) {
  if (!rec || typeof rec !== 'object') throw new Error('Invalid payload');
  const rows = [];
  const now = new Date();
  Object.keys(rec).forEach(yr => {
    Object.keys(rec[yr] || {}).forEach(mo => {
      const month = rec[yr][mo] || {};
      CATEGORIES.forEach(cat => {
        (month[cat] || []).forEach((it, i) => {
          const json = JSON.stringify(it);
          if (json.length > 45000) throw new Error('單筆資料過大（' + cat + '）');
          rows.push([companyId, Number(yr), Number(mo), cat, it.id || (cat + '_' + i),
                     it.site || '', it.emission == null ? '' : it.emission, json, now]);
        });
      });
    });
  });
  // 整份快照覆寫：先刪這家公司的舊列，再一次寫入新列
  const sh = getSheet_('records');
  deleteCompanyRows_(sh, companyId);
  if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, SHEETS.records.length).setValues(rows);
  return rows.length;
}

function deleteCompanyRows_(sh, companyId) {
  const last = sh.getLastRow();
  if (last < 2) return;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues();
  // 由下往上刪，避免列號位移
  for (let i = ids.length - 1; i >= 0; i--) {
    if (ids[i][0] === companyId) sh.deleteRow(i + 2);
  }
}

// ── 排放係數 ─────────────────────────────────────

function loadCoeff_(companyId) {
  const sh = getSheet_('coeff');
  const last = sh.getLastRow();
  if (last < 2) return null;
  const rows = sh.getRange(2, 1, last - 1, 2).getValues();
  const hit = rows.find(r => r[0] === companyId);
  return hit ? JSON.parse(hit[1]) : null;
}

function saveCoeff_(companyId, coeff) {
  if (!coeff || typeof coeff !== 'object') throw new Error('Invalid payload');
  const json = JSON.stringify(coeff);
  if (json.length > 45000) throw new Error('係數資料過大');
  const sh = getSheet_('coeff');
  deleteCompanyRows_(sh, companyId);
  sh.appendRow([companyId, json, new Date()]);
  return 1;
}

// ── 帳單辨識（金鑰只在這裡）────────────────────────

function hasVisionKey_() {
  const pr = PropertiesService.getScriptProperties();
  return !!(pr.getProperty('GEMINI_API_KEY') || pr.getProperty('ANTHROPIC_API_KEY'));
}

function scanBill_(companyId, p) {
  const props = PropertiesService.getScriptProperties();
  const geminiKey = props.getProperty('GEMINI_API_KEY');
  const claudeKey = props.getProperty('ANTHROPIC_API_KEY');
  if (!geminiKey && !claudeKey) throw new Error('後端尚未設定 GEMINI_API_KEY 或 ANTHROPIC_API_KEY');
  const mime = String(p.mimeType || '');
  const isPdf = mime === 'application/pdf';
  if (!isPdf && !/^image\/(jpeg|png|webp|gif)$/.test(mime)) throw new Error('不支援的檔案格式：' + mime);
  if (!p.base64 || typeof p.base64 !== 'string') throw new Error('缺少檔案內容');

  const bytes = Utilities.base64Decode(p.base64);
  if (bytes.length > MAX_UPLOAD_BYTES) throw new Error('檔案超過 10MB');

  const hint = p.billType === 'electricity' ? '這是電費單'
             : p.billType === 'water' ? '這是水費單' : '請自動判斷是電費單還是水費單';
  const prompt = '請分析這份台灣公用事業帳單（' + hint + '），提取以下資訊並只回傳 JSON，不要任何說明文字：\n\n' +
    '{\n  "billType": "electricity" 或 "water",\n  "site": "場域名稱（從地址判斷）",\n  "meter": "電號或水號",\n' +
    '  "startDate": "YYYY-MM-DD",\n  "endDate": "YYYY-MM-DD",\n  "period": "帳單期間說明",\n' +
    '  "kwh": 用電度數（數字，電費單用）,\n  "usage": 用水度數（數字，水費單用）,\n' +
    '  "amount": 應繳金額（數字，不含單位）,\n  "address": "用電/用水地址",\n  "note": "其他備註（如跨期說明）"\n}\n\n' +
    '如果某欄位讀不到，填 null。金額只取數字不含逗號。日期若是民國年請轉成西元年。帳單上的文字通常很小，請仔細逐欄閱讀；只有真的完全看不到的欄位才填 null。';

  const text = geminiKey ? callGemini_(geminiKey, mime, p.base64, prompt) : callClaude_(claudeKey, mime, p.base64, prompt);
  const clean = String(text || '').replace(/```json|```/g, '').trim();
  let parsed;
  try { parsed = JSON.parse(clean); } catch (e) { throw new Error('AI 回傳格式異常：' + clean.slice(0, 200)); }
  if (Array.isArray(parsed)) parsed = parsed[0] || {};
  // 使用者在畫面上指定了帳單類型就以他為準，AI 讀不出來時不要亂猜
  if (p.billType === 'electricity' || p.billType === 'water') parsed.billType = p.billType;
  parsed._raw = clean.slice(0, 400); // 除錯用：前端看不到，只在「解析結果全空」時用來判斷原因

  // 原圖存 Drive 當佐證；失敗不影響辨識結果
  let driveUrl = '';
  try {
    const folder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID'));
    const name = (p.fileName || ('bill_' + Date.now())).replace(/[\\/:*?"<>|]/g, '_');
    driveUrl = folder.createFile(Utilities.newBlob(bytes, mime, name)).getUrl();
  } catch (e) { /* 略過 */ }

  getSheet_('bills').appendRow([
    companyId, p.billId || '', p.fileName || '', parsed.billType || '', parsed.site || '', parsed.meter || '',
    parsed.startDate || '', parsed.endDate || '',
    parsed.billType === 'water' ? (parsed.usage == null ? '' : parsed.usage) : (parsed.kwh == null ? '' : parsed.kwh),
    parsed.amount == null ? '' : parsed.amount, driveUrl, 'pending', new Date()
  ]);
  return { parsed: parsed, driveUrl: driveUrl };
}

function callClaude_(apiKey, mime, base64, prompt) {
  const isPdf = mime === 'application/pdf';
  const block = isPdf
    ? { type: 'document', source: { type: 'base64', media_type: mime, data: base64 } }
    : { type: 'image',    source: { type: 'base64', media_type: mime, data: base64 } };
  const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({
      model: PropertiesService.getScriptProperties().getProperty('MODEL') || DEFAULT_MODEL,
      max_tokens: 1000,
      messages: [{ role: 'user', content: [block, { type: 'text', text: prompt }] }]
    }),
    muteHttpExceptions: true
  });
  const code = resp.getResponseCode();
  const body = JSON.parse(resp.getContentText());
  if (code !== 200) throw new Error((body.error && body.error.message) || ('Claude API 錯誤 ' + code));
  const tb = (body.content || []).find(c => c.type === 'text');
  return tb && tb.text;
}

function callGemini_(apiKey, mime, base64, prompt) {
  const model = PropertiesService.getScriptProperties().getProperty('GEMINI_MODEL') || DEFAULT_GEMINI_MODEL;
  const resp = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-goog-api-key': apiKey },
    payload: JSON.stringify({
      contents: [{ parts: [{ inline_data: { mime_type: mime, data: base64 } }, { text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', mediaResolution: 'MEDIA_RESOLUTION_HIGH' }
    }),
    muteHttpExceptions: true
  });
  const code = resp.getResponseCode();
  const body = JSON.parse(resp.getContentText());
  if (code !== 200) throw new Error((body.error && body.error.message) || ('Gemini API 錯誤 ' + code));
  const parts = (body.candidates && body.candidates[0] && body.candidates[0].content && body.candidates[0].content.parts) || [];
  const t = parts.map(x => x.text || '').join('');
  if (!t) throw new Error('Gemini 沒有回傳內容（可能被安全機制擋下）');
  return t;
}

function listBills_(companyId) {
  const sh = getSheet_('bills');
  const last = sh.getLastRow();
  if (last < 2) return [];
  const rows = sh.getRange(2, 1, last - 1, SHEETS.bills.length).getValues();
  return rows.filter(r => r[0] === companyId).map(r => {
    const o = {};
    SHEETS.bills.forEach((h, i) => {
      let v = r[i];
      if (v instanceof Date) v = Utilities.formatDate(v, 'Asia/Taipei', 'yyyy-MM-dd HH:mm:ss');
      o[h] = v === '' ? null : v;
    });
    return o;
  });
}
