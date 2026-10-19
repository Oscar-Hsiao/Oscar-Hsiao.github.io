/**
 * 全國法規資料庫 全文查詢代理（Proxy）— Cloudflare Worker 版
 * （GAS 版本卡在 Google 帳戶「This app is blocked」，改用 Cloudflare Workers 免這個問題）
 *
 * 部署步驟：
 * 1. 到 https://dash.cloudflare.com/sign-up 註冊（只需要 email + 密碼，沒有 OAuth 授權畫面）
 * 2. 登入後左側選單找「Workers 和 Pages」→「建立」→「建立 Worker」
 * 3. 取個名字（例如 law-proxy），點「部署」建立空白 Worker
 * 4. 點「編輯程式碼」，把這個檔案全部內容貼進去，取代預設內容
 * 5. 點右上角「部署」
 * 6. 複製網址（長得像 https://law-proxy.你的帳號.workers.dev），
 *    貼到 法規登記系統.html 的 GAS_URL 和 法規白話文轉換工具.html 的 LAW_API_URL
 *
 * 呼叫方式（跟 GAS 版完全相同）：
 *   GET {部署網址}?pcode=N0060001            → 該法規全文（含章節、逐條條文）
 *   GET {部署網址}?pcode=N0060001&flno=6      → 單一條文（第6條）
 */

const LAW_BASE = 'https://law.moj.gov.tw/LawClass/';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};

const IMAGE_TTL_SECONDS = 21600; // 6小時

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // ── 圖片：上傳（POST /upload，body: {data, mimeType}）──
    if (request.method === 'POST' && url.pathname === '/upload') {
      try {
        const body = await request.json();
        if (!body.data) throw new Error('缺少圖片資料');
        const id = crypto.randomUUID();
        await env.IMAGES.put(id, body.data, {
          expirationTtl: IMAGE_TTL_SECONDS,
          metadata: { mimeType: body.mimeType || 'image/png' },
        });
        return json({ ok: true, url: `${url.origin}/img/${id}` });
      } catch (err) {
        return json({ ok: false, error: err.message });
      }
    }

    // ── 圖片：讀取（GET /img/{id}）──
    if (request.method === 'GET' && url.pathname.startsWith('/img/')) {
      const id = url.pathname.replace('/img/', '');
      const stored = await env.IMAGES.getWithMetadata(id);
      if (!stored.value) {
        return new Response('Not found', { status: 404, headers: CORS_HEADERS });
      }
      const mimeType = (stored.metadata && stored.metadata.mimeType) || 'image/png';
      const bytes = base64ToBytes(stored.value);
      return new Response(bytes, {
        headers: { 'Content-Type': mimeType, 'Access-Control-Allow-Origin': '*' },
      });
    }

    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');

    if (lat && lon) {
      try {
        const data = await reverseGeocode(lat, lon);
        return json({ ok: true, ...data });
      } catch (err) {
        return json({ ok: false, error: err.message });
      }
    }

    const pcode = (url.searchParams.get('pcode') || '').trim();
    const flno = (url.searchParams.get('flno') || '').trim();

    if (!pcode) {
      return json({ ok: false, error: '缺少 pcode 參數（法規查詢）或 lat/lon 參數（定位查詢）' });
    }

    try {
      const data = flno ? await fetchSingleArticle(pcode, flno) : await fetchFullLaw(pcode);
      return json({ ok: true, ...data });
    } catch (err) {
      return json({ ok: false, error: err.message, pcode });
    }
  },
};

function base64ToBytes(base64) {
  const binString = atob(base64);
  const bytes = new Uint8Array(binString.length);
  for (let i = 0; i < binString.length; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

// ── GPS 反查所在縣市 ──────────────────────────────────
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&accept-language=zh-TW`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'OscarSecretaryBot/1.0 (contact: oscarclon1112@gmail.com)' },
  });
  if (!res.ok) throw new Error('定位服務連線失敗（HTTP ' + res.status + '）');
  const data = await res.json();
  const address = data.address || {};
  const city = address.city || address.county || null;
  return { city };
}

function json(obj) {
  return new Response(JSON.stringify(obj), { headers: CORS_HEADERS });
}

// ── 全文查詢 ──────────────────────────────────────────
async function fetchFullLaw(pcode) {
  const url = LAW_BASE + 'LawAll.aspx?pcode=' + encodeURIComponent(pcode);
  const res = await fetch(url);
  if (!res.ok) throw new Error('連線全國法規資料庫失敗（HTTP ' + res.status + '）');
  const html = await res.text();

  const name = matchOne(html, /<a id="hlLawName"[^>]*>([^<]+)<\/a>/);
  if (!name) throw new Error('查無此法規（pcode=' + pcode + '）');

  const mod = parseModDate(html);
  const { chapters, articles } = parseArticles(html);

  return {
    pcode,
    name,
    mod, // 格式：113/08/01（民國年/月/日，跟法規登記系統一致）
    chapterCount: chapters,
    articles, // [{no, chapter, text}]
    sourceUrl: url,
  };
}

// ── 單一條文查詢 ──────────────────────────────────────
async function fetchSingleArticle(pcode, flno) {
  const url = LAW_BASE + 'LawSingle.aspx?pcode=' + encodeURIComponent(pcode) + '&flno=' + encodeURIComponent(flno);
  const res = await fetch(url);
  if (!res.ok) throw new Error('連線全國法規資料庫失敗（HTTP ' + res.status + '）');
  const html = await res.text();

  const name = matchOne(html, /<a id="hlLawName"[^>]*>([^<]+)<\/a>/)
    || matchOne(html, /<title>\s*([^<]+?)-全國法規資料庫/);

  const startIdx = html.indexOf('law-article');
  if (startIdx === -1) throw new Error('查無此條號（pcode=' + pcode + ', flno=' + flno + '）');
  const endIdx = html.indexOf('clearfix', startIdx);
  const segment = html.slice(startIdx, endIdx === -1 ? html.length : endIdx);
  const text = extractLines(segment);
  if (!text) throw new Error('查無此條號（pcode=' + pcode + ', flno=' + flno + '）');

  return {
    pcode,
    name: name ? name.trim() : '',
    article: { no: flno, text },
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
