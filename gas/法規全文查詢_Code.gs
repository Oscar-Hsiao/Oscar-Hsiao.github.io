/**
 * 全國法規資料庫 全文查詢代理（Proxy）— Google Apps Script 後端
 *
 * 用途：
 *   官方「全國法規資料庫」JSON API（law.moj.gov.tw/api/ch/law/json）
 *   1) 沒有開放 CORS，瀏覽器 JS 無法直接呼叫
 *   2) 一次回傳「全國所有法規」壓縮檔（約 6MB zip / 25MB JSON），不適合單條查詢
 *   這支程式改成直接讀取官方網頁版（LawAll.aspx / LawSingle.aspx，跟
 *   「法規登記系統」點法規名稱連去的頁面一樣），在伺服器端解析出乾淨的
 *   JSON，並讓瀏覽器能跨網域讀取。
 *
 * 供以下兩個工具共用：
 *   - 法規登記系統.html（「自動更新（官方API）」按鈕，抓修正日期）
 *   - 法規白話文轉換工具.html（「抓取最新條文」，抓逐條條文全文）
 *
 * 部署步驟：
 * 1. 到 https://script.google.com/ 建立新專案（不需要綁試算表）
 * 2. 把這份程式碼全部貼入 Code.gs，儲存
 * 3. 點「部署」→「新增部署作業」
 *    - 類型：網頁應用程式
 *    - 執行身分：我
 *    - 誰可以存取：所有人
 * 4. 複製部署網址，貼到兩個 HTML 檔案的 GAS_URL / LAW_API_URL 欄位
 *
 * 呼叫方式：
 *   GET {部署網址}?pcode=N0060001            → 該法規全文（含章節、逐條條文）
 *   GET {部署網址}?pcode=N0060001&flno=6      → 單一條文（第6條）
 */

const LAW_BASE = 'https://law.moj.gov.tw/LawClass/';
const CACHE_TTL_SEC = 6 * 60 * 60; // 6 小時

function doGet(e) {
  const pcode = (e.parameter.pcode || '').trim();
  const flno = (e.parameter.flno || '').trim();

  if (!pcode) {
    return respond({ ok: false, error: '缺少 pcode 參數' });
  }

  try {
    const data = flno ? fetchSingleArticle(pcode, flno) : fetchFullLaw(pcode);
    return respond({ ok: true, ...data });
  } catch (err) {
    return respond({ ok: false, error: err.message, pcode });
  }
}

// ── 全文查詢（法規登記系統的「自動更新」與白話文轉換工具的「抓取最新條文」都用這個）──
function fetchFullLaw(pcode) {
  const cacheKey = 'law_' + pcode;
  const cache = CacheService.getScriptCache();
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const url = LAW_BASE + 'LawAll.aspx?pcode=' + encodeURIComponent(pcode);
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) {
    throw new Error('連線全國法規資料庫失敗（HTTP ' + res.getResponseCode() + '）');
  }
  const html = res.getContentText();

  const name = matchOne(html, /<a id="hlLawName"[^>]*>([^<]+)<\/a>/);
  if (!name) throw new Error('查無此法規（pcode=' + pcode + '）');

  const mod = parseModDate(html);
  const { chapters, articles } = parseArticles(html);

  const data = {
    pcode,
    name,
    mod,           // 格式：113/08/01（民國年/月/日，跟現有法規登記系統一致）
    chapterCount: chapters,
    articles,       // [{no, chapter, text}]
    sourceUrl: url,
  };

  try {
    const json = JSON.stringify(data);
    if (json.length < 95000) cache.put(cacheKey, json, CACHE_TTL_SEC);
  } catch (e) { /* 快取失敗不影響回應 */ }

  return data;
}

// ── 單一條文查詢（比較輕量，用於白話文轉換工具「重新抓這一條」）──
function fetchSingleArticle(pcode, flno) {
  const url = LAW_BASE + 'LawSingle.aspx?pcode=' + encodeURIComponent(pcode) + '&flno=' + encodeURIComponent(flno);
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) {
    throw new Error('連線全國法規資料庫失敗（HTTP ' + res.getResponseCode() + '）');
  }
  const html = res.getContentText();
  const name = matchOne(html, /<a id="hlLawName"[^>]*>([^<]+)<\/a>/) || matchOne(html, /<title>\s*([^<]+?)-全國法規資料庫/);
  const raw = matchOne(html, /<div class="col-data"><div class="law-article">([\s\S]*?)<\/div>\s*<\/div><\/div>/);
  if (!raw) throw new Error('查無此條號（pcode=' + pcode + ', flno=' + flno + '）');

  return {
    pcode,
    name: name ? name.trim() : '',
    article: { no: flno, text: extractLines(raw) },
    sourceUrl: url,
  };
}

// ── 解析輔助 ──────────────────────────────────────────
function parseModDate(html) {
  const m = html.match(/<tr id="trLNNDate">[\s\S]*?民國\s*(\d+)\s*年\s*(\d+)\s*月\s*(\d+)\s*日/);
  if (!m) return '';
  const y = m[1], mo = ('0' + m[2]).slice(-2), d = ('0' + m[3]).slice(-2);
  return `${y}/${mo}/${d}`;
}

function parseArticles(html) {
  const pattern = /<div class="h3 char-\d+">\s*([^<]+?)\s*<\/div>|<div class="col-no">\s*(?:<a[^>]*>)?第\s*([^<]+?)\s*條(?:<\/a>)?\s*<\/div><div class="col-data"><div class="law-article">([\s\S]*?)<\/div>\s*<\/div><\/div>/g;
  let curChapter = '';
  let chapterCount = 0;
  const articles = [];
  let m;
  while ((m = pattern.exec(html)) !== null) {
    if (m[1]) {
      curChapter = m[1].trim();
      chapterCount++;
    } else {
      articles.push({
        no: m[2].trim(),
        chapter: curChapter,
        text: extractLines(m[3]),
      });
    }
  }
  return { chapters: chapterCount, articles };
}

function extractLines(rawHtml) {
  const lineMatches = rawHtml.match(/<div class="line-\d+[^"]*">([\s\S]*?)<\/div>/g) || [];
  const lines = lineMatches.map(l => {
    const inner = l.replace(/^<div class="line-\d+[^"]*">/, '').replace(/<\/div>$/, '');
    return inner.replace(/<[^>]+>/g, '').trim();
  });
  return lines.filter(l => l).join('\n');
}

function matchOne(text, re) {
  const m = text.match(re);
  return m ? m[1] : null;
}

// ── JSON 回應 ──────────────────────────────────────────
function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
