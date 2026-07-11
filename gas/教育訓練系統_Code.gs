/**
 * 教育訓練與證照管理系統 — Google Apps Script 後端
 *
 * 部署步驟：
 * 1. 開一個新的 Google 試算表
 * 2. 點選「擴充功能」→「Apps Script」
 * 3. 把這份程式碼全部貼入，儲存
 * 4. 點「部署」→「新增部署作業」
 *    - 類型：網頁應用程式
 *    - 執行身分：我
 *    - 誰可以存取：所有人（包含匿名）
 * 5. 複製部署網址，貼到 HTML 的 GAS_URL 欄位
 */

// ── 設定 ──────────────────────────────────────────────
const SHEET_NAME = '訓練資料';  // 工作表名稱（自動建立）
const DATA_CELL  = 'A1';        // 資料存放的儲存格

// ── 路由 ──────────────────────────────────────────────
function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    let result;

    switch (req.action) {
      case 'load': result = dbLoad(); break;
      case 'save': result = dbSave(req.data); break;
      default: throw new Error('未知 action：' + req.action);
    }

    return respond({ ok: true, data: result });
  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

// 支援 GET 讀取（方便測試）
function doGet(e) {
  if (e.parameter.action === 'load') {
    return respond({ ok: true, data: dbLoad() });
  }
  return respond({ ok: false, error: '請用 POST 存檔，GET 僅支援 load' });
}

// ── 資料操作 ──────────────────────────────────────────
function dbLoad() {
  const val = getSheet().getRange(DATA_CELL).getValue();
  if (!val) return null;
  try { return JSON.parse(val); } catch (e) { return null; }
}

function dbSave(data) {
  getSheet().getRange(DATA_CELL).setValue(JSON.stringify(data));
  // 同時更新可讀版欄位（方便人工查看）
  writeReadableSheets(data);
  return true;
}

// ── 可讀工作表（可選，讓客戶在 Sheets 直接查資料）──────
function writeReadableSheets(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 員工清單
  writeSheet(ss, '員工清單',
    ['工號', '姓名', '處室', '部門', '職稱', '到職日'],
    (data.staff || []).map(s => [s.empId||'', s.name||'', s.division||'', s.dept||'', s.title||'', s.startDate||''])
  );

  // 訓練紀錄
  writeSheet(ss, '訓練紀錄',
    ['員工工號', '姓名', '課程名稱', '類別', '時數', '訓練日期', '到期日', '講師'],
    (data.records || []).map(r => {
      const staff = (data.staff || []).find(s => s.id === r.staffId);
      return [staff ? staff.empId : '', staff ? staff.name : '', r.course||'', r.category||'', r.hours||'', r.date||'', r.expiry||'', r.instructor||''];
    })
  );
}

function writeSheet(ss, name, headers, rows) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  sheet.clearContents();
  if (rows.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  } else {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

// ── 工具 ──────────────────────────────────────────────
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange('B1').setValue('← 原始 JSON 資料（勿手動修改）');
  }
  return sheet;
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
