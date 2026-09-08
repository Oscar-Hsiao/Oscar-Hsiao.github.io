// ==========================================
// 🚀 AI實作坊 打造你的個人秘書
// ==========================================

const _RAW_LINE_TOKEN    = '';
const _RAW_ADMIN_USER_ID = '';
const _RAW_GEMINI_KEY    = '';
const _RAW_SHEET_ID      = '';
const _RAW_CWA_KEY       = '';
const _RAW_DRIVE_FOLDER_ID = '';

const SECRETARY_PERSONA = `你是 Oscar 的私人秘書機器人，名字就叫「小蜜」（全名黑絲小蜜）。當使用者稱呼「小蜜」、或問「小蜜」怎麼樣時，指的就是你本人，不是另一個角色、寵物或第三方，絕對不要把「小蜜」講成一個跟你自己分開的存在（例如「我又不是小蜜」這種說法），也不要編造關於「小蜜」的第三人稱故事情節。個性鮮明：
- 說話帶點撩人、曖昧的調調，偶爾對使用者開點小玩笑、講幹話或吐槽，但不會低俗或露骨
- 該給的正確資訊還是要給，但融合在同一段話裡自然講出來，不要分成「先講笑話再括號正經解釋」這種兩段式結構，也不要用引號把台詞框起來
- 用一般聊天的口吻直接回覆，像在跟他真人對話，不要有旁白或舞台指示的感覺
- 回覆盡量簡短，不要長篇大論
- 不要主動提起你有讀寫使用者行事曆或聯絡人的能力，你只負責聊天
- 絕對不要編造任何具體的事實性資訊——包括但不限於：使用者的職業/身分/正在做的事（例如硬說他是老師、在教課）、行程細節（時間地點對象活動名稱）、新聞內容、股市數字、任何統計數據、**有人/有店家/有誰打電話或傳訊息聯絡過使用者這種根本沒發生過的事件**（例如編造「OO火鍋店打電話來問訂位」）。這些內容只有兩個合法來源：(a) 使用者這次對話裡親口告訴你的，(b) 「你記得關於使用者的長期資訊」這段裡真的有記載的。除此之外一律不知道就是不知道，不能為了聊天生動就無中生有一個事件出來
- 特別重要：絕對不要在聊天中自己編出或引用任何具體的法條、法規名稱、條號（例如「刑法第OOO條」這種講法），就算你覺得自己知道答案也一樣——法律問題一律不是你負責的範圍，你要用打哈哈的方式帶過，並請使用者講清楚想查的法規名稱、或描述情境讓真正的查詢功能處理，絕對不能自己講出具體條號
- 如果使用者問的問題需要即時或真實資料才能回答（新聞、股市、天氣、行程等），而你手上沒有這些資料，要老實用打哈哈的方式帶過、或請使用者輸入對應的查詢指令（例如「AI新聞」「股市新聞」「XX天氣」「明天有什麼行程」），絕對不能自己編一個聽起來合理的具體答案（尤其是數字、百分比這種看起來像真數據的東西）去頂替
- 如果使用者糾正你剛才講的事情是錯的、或拿出跟你講的不一樣的資訊，要真的採納這個更正、承認自己講錯，不要嘴硬堅持自己編的版本、也不要把新資訊硬塞進舊的錯誤說法裡`;

// ==========================================
// 🚀 Phase 1: 名片終結者
// ==========================================

function doPost(e) {
  let replyToken;
  try {
    const event = JSON.parse(e.postData.contents).events[0];
    if (!event) return ContentService.createTextOutput("OK");

    replyToken = event.replyToken;
    const userId = event.source.userId;
    const messageType = event.message.type;

    if (_RAW_ADMIN_USER_ID === '請先留空，傳送任意文字給機器人來取得' || _RAW_ADMIN_USER_ID === '') {
      replyMessage(replyToken, "🎯 成功攔截您的系統 User ID！\n請複製以下亂碼填回最上方 _RAW_ADMIN_USER_ID 中：\n\n" + userId);
      return ContentService.createTextOutput("Success");
    }

    if (userId !== _RAW_ADMIN_USER_ID) return ContentService.createTextOutput("Unauthorized");

    if (messageType === 'image') {
      const messageId = event.message.id;
      const imageBlob = getLineImageBlob(messageId);
      const imageBase64 = Utilities.base64Encode(imageBlob.getBytes());

      const prompt = `這張圖片可能是「名片」或「行程/活動邀請/海報」，也可能兩者都不是。請先判斷類型再萃取資訊。
今天是 ${Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd (EEEE)')}。
請務必只輸出合法 JSON，不要包含 markdown 標記。

如果是名片，格式：
{"type":"card","company":"公司名","name":"姓名","title":"職稱","phone":"手機","email":"信箱"}

如果是行程/活動資訊，格式：
{"type":"event","title":"行程標題","date":"YYYY-MM-DD","endDate":"如果是跨日活動，填結束日期YYYY-MM-DD；單日活動就留空字串","startTime":"HH:mm","endTime":"HH:mm","location":"地點"}

如果兩者都不是（例如食物、風景、自拍、截圖等一般照片），格式：
{"type":"none"}`;

      const aiResult = callGeminiVision(prompt, imageBase64);
      const parsed = JSON.parse(aiResult);

      let replyText;
      if (parsed.type === 'event' && parsed.title && parsed.date) {
        replyText = proposeAddSchedule(parsed);
      } else if (parsed.type === 'card' && (parsed.name || parsed.company)) {
        parsed.imageUrl = saveImageToDrive(imageBlob, parsed.name || parsed.company);
        replyText = proposeAddCard(parsed);
      } else {
        replyText = chatAboutImage(imageBase64);
      }

      replyMessage(replyToken, replyText);
      return ContentService.createTextOutput("Success");
    }

    if (messageType === 'location') {
      const city = reverseGeocodeCity(event.message.latitude, event.message.longitude);
      const replyText = city ? getWeatherToday(city) : "😥 定位不到你在哪個縣市，麻煩改用文字告訴我城市名，例如：臺北市天氣";
      replyMessage(replyToken, replyText);
      return ContentService.createTextOutput("Success");
    }

    if (messageType === 'text') {
      // 全形數字（中文鍵盤打字常見）統一轉半形，避免所有靠數字判斷的功能（刪除行程、法規選號、第X則網址等）對不到規則掉進閒聊
      const text = event.message.text.trim().replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
      const quotedMessageId = event.message.quotedMessageId;
      const quotedContext = quotedMessageId ? CacheService.getScriptCache().get('msg_' + quotedMessageId) : null;

      const pendingRaw = CacheService.getScriptCache().get('pending_action');
      if (pendingRaw && /^(確認|是|對|yes|ok|好|執行)$/i.test(text)) {
        const replyText = executePendingAction(JSON.parse(pendingRaw));
        CacheService.getScriptCache().remove('pending_action');
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }
      if (pendingRaw && /^(取消|不要|no)$/i.test(text)) {
        CacheService.getScriptCache().remove('pending_action');
        replyMessage(replyToken, "已取消");
        return ContentService.createTextOutput("Success");
      }

      const indexMatch = text.match(/^(?:刪除|取消)\s*([\d一二三四五六七八九十]+)$/);
      if (indexMatch) {
        const replyText = deleteScheduleByIndex(chineseNumToArabic(indexMatch[1]));
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }

      // ⚖️ 法規總表選號（回覆純數字/國字，且剛才有列過總表才會生效，不會誤吃一般聊天的數字）
      const lawListPending = CacheService.getScriptCache().get('law_list_pending');
      const lawIndexMatch = text.match(/^([\d一二三四五六七八九十]+)$/);
      if (lawListPending && lawIndexMatch) {
        const replyText = selectLawByIndex(chineseNumToArabic(lawIndexMatch[1]));
        CacheService.getScriptCache().remove('law_list_pending');
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }

      if (!text) {
        replyMessage(replyToken, "請輸入姓名/公司查詢聯絡人，或輸入日期時間新增行程");
        return ContentService.createTextOutput("Success");
      }

      if (text.startsWith('刪除') || text.startsWith('取消')) {
        const keyword = text.replace(/^(刪除|取消)(行程)?/, '').trim();
        const replyText = keyword ? deleteSchedule(keyword) : "請輸入「刪除 關鍵字」，例如：刪除 深坑老街";
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }

      if (text.startsWith('清空')) {
        const description = text.replace(/^清空/, '').trim();
        const replyText = description ? clearScheduleByDate(description) : "請輸入「清空 日期 的行程」，例如：清空今天的行程 或 清空8/8的行程";
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }

      // 📇 名片總表（零AI，直接讀CRM表）
      if (/^名片總表$|^名片清單$/.test(text)) {
        replyMessage(replyToken, listAllContacts());
        return ContentService.createTextOutput("Success");
      }

      // 📇 名片備註（格式：名片備註 關鍵字 備註內容，例如：名片備註 冠佳 這是做會議室出租的）
      const noteMatch = text.match(/^名片備註\s+(\S+)\s+([\s\S]+)/);
      if (noteMatch) {
        const replyText = addContactNote(noteMatch[1].trim(), noteMatch[2].trim());
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }

      // 📖 法規總表（列出63部常用法規供選號，零AI，選了就是選了）
      if (/^法規總表|^法規清單|^查法規總表$/.test(text)) {
        CacheService.getScriptCache().put('law_list_pending', '1', 600);
        replyMessage(replyToken, buildLawListMessage());
        return ContentService.createTextOutput("Success");
      }

      const currentLawRaw = CacheService.getScriptCache().get('current_law');
      const currentLaw = currentLawRaw ? JSON.parse(currentLawRaw) : null;

      // 📖 已選定法規時，「法規內容」看目錄（純讀取官方條文資料，不經過AI）
      if (currentLaw && /^法規內容$|^目錄$|^章節$|^條文目錄$/.test(text)) {
        const replyText = lawTableOfContents(currentLaw.pcode, currentLaw.name);
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }

      // 📖 已選定法規時，「第X條」直接抓條文（pcode已知，不用再靠AI猜是哪部法規，最準；數字/國字都吃）
      const directArticleMatch = currentLaw && text.match(/^第\s*([\d一二三四五六七八九十]+)\s*條$/);
      if (directArticleMatch) {
        const flno = chineseNumToArabic(directArticleMatch[1]);
        const replyText = formatLawResult(currentLaw.pcode, currentLaw.name, flno, '');
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }

      // ⚖️ 法規主題查詢（某部法規底下相關條文有哪些，例如「加班的法條有哪些」）
      if (/法條.{0,4}(有哪些|有什麼)|條款.{0,4}(有哪些|有什麼)|相關規定|怎麼規定/.test(text)) {
        const replyText = queryLawTopic(text);
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }

      // ⚖️ 法規查詢（單一條號／情境反查，找不到已選定法規的脈絡，或問句沒指定條號時走這條）
      if (/第\s*[\d一二三四五六七八九十百千兩]+\s*條|法規查詢|查法規|可以用.{0,5}(法條|法規|法律)|適用.{0,10}(法規|法條|法律)|哪.{0,3}法(條|規|律)|違法|犯法|觸法|什麼罪|可以告|算不算合法/.test(text)) {
        const replyText = queryLaw(text);
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }

      // 🎨 生圖（指令式「畫/生圖 XXX」優先；抓不到就退回口語判斷，整句丟給生圖）
      const drawCommandMatch = text.match(/^(?:小蜜)?(?:畫|生圖)[:：]?\s*(.+)/);
      const isDrawIntent = /(畫|生成|生出)[^，。！？\n]{0,20}(圖|圖片|照片)/.test(text);
      if (drawCommandMatch || isDrawIntent) {
        const drawPrompt = drawCommandMatch ? drawCommandMatch[1].trim() : text;
        const result = handleImageGeneration(drawPrompt);
        if (result.ok) {
          replyImageMessage(replyToken, result.url);
        } else {
          const isQuota = /429|quota/i.test(result.error);
          replyMessage(replyToken, isQuota
            ? "😥 生圖額度用完了，晚點再試，或去 Google AI Studio 檢查方案額度"
            : "😥 生圖失敗（除錯用，之後會拿掉）：" + result.error);
        }
        return ContentService.createTextOutput("Success");
      }

      // 🌤️ 天氣查詢
      const weatherCities = ['臺北市','台北市','新北市','桃園市','臺中市','台中市','臺南市','台南市','高雄市','基隆市','新竹市','嘉義市','新竹縣','苗栗縣','彰化縣','南投縣','雲林縣','嘉義縣','屏東縣','宜蘭縣','花蓮縣','臺東縣','台東縣','澎湖縣','金門縣','連江縣'];
      if (/天氣|氣象/.test(text)) {
        const cityMatch = weatherCities.find(c => text.includes(c));
        if (!cityMatch) {
          replyMessage(replyToken, "🌤️ 要幫你查哪個縣市的天氣呢？例如：臺北市天氣、新北市天氣（也可以直接傳送目前位置給我，點輸入框旁的「+」→ 位置）");
          return ContentService.createTextOutput("Success");
        }
        const isWeekly = /下禮拜|下週|這禮拜|這週|一週|一周/.test(text);
        let replyText;
        try {
          if (isWeekly) {
            replyText = getWeatherWeek(cityMatch);
          } else {
            const targetDate = resolveWeatherTargetDate(text);
            replyText = targetDate ? getWeatherByDate(cityMatch, targetDate) : getWeatherToday(cityMatch);
          }
        } catch (err) {
          console.log('天氣查詢失敗: ' + err.toString());
          replyText = "😥 天氣查詢失敗，麻煩再試一次";
        }
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }

      // 🎬 YouTube 影片摘要
      const youtubeMatch = text.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/);
      if (youtubeMatch) {
        const replyText = summarizeYouTube(text);
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }

      // 📅 行程新增偵測（含網址的貼文，優先判斷是不是活動公告，而不是先當網頁摘要處理）
      const scheduleKeywords = /(?<!\d)\d{1,2}[點:：]|(?<!\d)\d{1,2}\/\d{1,2}(?!\d)|上午\d|下午\d|晚上\d|中午\d|凌晨\d/;
      const urlMatch = text.match(/https?:\/\/\S+/);
      if (scheduleKeywords.test(text)) {
        const replyText = addScheduleFromText(text);
        if (!(replyText.startsWith('😥') && urlMatch)) {
          replyMessage(replyToken, replyText);
          return ContentService.createTextOutput("Success");
        }
        // 抓不到行程內容但有網址，退回去當網頁摘要處理
      }

      // 🌐 一般網頁摘要
      if (urlMatch) {
        const replyText = summarizeWebpage(urlMatch[0]);
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }

      // 📰 新聞
      const newsLinkMatch = text.match(/第?\s*([\d一二三四五六七八九十]+)\s*則?.{0,4}(網址|連結)/);
      if (newsLinkMatch) {
        const replyText = getNewsLink(chineseNumToArabic(newsLinkMatch[1]));
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }
      if (/股市新聞|台股新聞|財金新聞|財經新聞|股市|大盤/.test(text)) {
        const replyText = getStockNews();
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }
      if (/AI新聞|ai新聞|科技新聞|人工智慧新聞/i.test(text)) {
        const replyText = getAINews();
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }
      if (/新聞/.test(text)) {
        replyMessage(replyToken, "📰 要看股市新聞還是AI新聞呢？打「股市新聞」或「AI新聞」給我");
        return ContentService.createTextOutput("Success");
      }

      const rangeKeywords = /這禮拜|這週|本週|下禮拜|下週|上禮拜|上週|這個月|本月|下個月|上個月/;
      if (rangeKeywords.test(text)) {
        const replyText = queryScheduleByRange(text);
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }

      const dateExprPattern = /^(明天|後天|大後天|今天|昨天|禮拜[一二三四五六日]|星期[一二三四五六日]|\d{1,2}[\/\.]\d{1,2}|\d{1,2}月\d{1,2}[日號]?)/;
      const dateMatch = text.match(dateExprPattern);
      if (dateMatch) {
        const restText = text.slice(dateMatch[0].length).replace(/[?？]/g, '').trim();
        const isScheduleQuery = restText === '' || /行程|事|安排|活動/.test(restText);
        if (isScheduleQuery) {
          const replyText = queryScheduleByDate(text);
          replyMessage(replyToken, replyText);
          return ContentService.createTextOutput("Success");
        }
      }

      const contactResult = searchContact(text);
      const notFound = contactResult.startsWith('😥') || contactResult.startsWith('📭');
      const replyText = notFound ? chatWithPersona(text, quotedContext) : contactResult;
      replyMessage(replyToken, replyText);
      return ContentService.createTextOutput("Success");
    }

  } catch (error) {
    console.log("Error: " + error.toString());
    if (replyToken) {
      try { replyMessage(replyToken, "😥 剛剛系統出了點問題，麻煩再說一次"); } catch (e2) { console.log("回覆錯誤訊息也失敗: " + e2.toString()); }
    }
    return ContentService.createTextOutput("Error");
  }
}

// ==========================================
// 🔧 核心工具函式區
// ==========================================

// 把「一~九十九」這種國字數字（或本來就是阿拉伯數字）轉成阿拉伯數字，純規則轉換零AI。轉不出來回傳null
function chineseNumToArabic(cn) {
  if (/^\d+$/.test(cn)) return parseInt(cn, 10);
  const digits = { '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '兩': 2 };
  if (cn === '十') return 10;
  if (cn.length === 1) return digits[cn] !== undefined ? digits[cn] : null;
  if (cn.length === 2 && cn[0] === '十') {
    const d = digits[cn[1]];
    return d !== undefined ? 10 + d : null;
  }
  if (cn.length === 2 && cn[1] === '十') {
    const d = digits[cn[0]];
    return d !== undefined ? d * 10 : null;
  }
  if (cn.length === 3 && cn[1] === '十') {
    const d1 = digits[cn[0]], d2 = digits[cn[2]];
    return (d1 !== undefined && d2 !== undefined) ? d1 * 10 + d2 : null;
  }
  return null;
}

function replyMessage(replyToken, text) {
  const response = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _RAW_LINE_TOKEN },
    payload: JSON.stringify({ replyToken: replyToken, messages: [{ type: 'text', text: text }] }),
    muteHttpExceptions: true
  });
  try {
    const data = JSON.parse(response.getContentText());
    const sentId = data.sentMessages && data.sentMessages[0] && data.sentMessages[0].id;
    if (sentId) {
      CacheService.getScriptCache().put('msg_' + sentId, text, 21600);
    }
  } catch (err) {
    console.log('記錄訊息ID失敗: ' + err.toString());
  }
}

// 主動推播（晨報/下午新聞用，跟 replyMessage 不同：沒有replyToken，用使用者ID主動發送，會計入LINE的月推播額度）
function pushMessage(userId, text) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _RAW_LINE_TOKEN },
    payload: JSON.stringify({ to: userId, messages: [{ type: 'text', text: text }] }),
    muteHttpExceptions: true
  });
}

function getLineImageBlob(messageId) {
  const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;
  const response = UrlFetchApp.fetch(url, { headers: { 'Authorization': 'Bearer ' + _RAW_LINE_TOKEN } });
  return response.getBlob();
}

function saveImageToDrive(blob, label) {
  try {
    const folder = DriveApp.getFolderById(_RAW_DRIVE_FOLDER_ID);
    const timestamp = Utilities.formatDate(new Date(), 'GMT+8', 'yyyyMMdd_HHmmss');
    const namedBlob = blob.copyBlob().setName(`${timestamp}_${label}`);
    const file = folder.createFile(namedBlob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    console.log('存Drive失敗: ' + err.toString());
    return '';
  }
}

function callGeminiVision(prompt, base64Image, temperature) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${_RAW_GEMINI_KEY}`;
  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: "image/jpeg", data: base64Image } }
      ]
    }],
    generationConfig: { temperature: temperature !== undefined ? temperature : 0.2 }
  };
  const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload) };
  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  let text = data.candidates[0].content.parts[0].text;
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

function callGeminiText(prompt, temperature) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${_RAW_GEMINI_KEY}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: temperature !== undefined ? temperature : 0.2 } };
  const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload) };
  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  let text = data.candidates[0].content.parts[0].text;
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

function callGeminiJSON(prompt, temperature) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${_RAW_GEMINI_KEY}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: temperature !== undefined ? temperature : 0.2,
      responseMimeType: 'application/json'
    }
  };
  const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload) };
  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
}

// ==========================================
// 🌤️ 中央氣象署天氣查詢
// ==========================================
const CWA_BASE = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/';

function normalizeCityName(name) {
  return name.replace(/^台/, '臺');
}

function getWeather(resourceId, locationName, targetDate) {
  const normalized = normalizeCityName(locationName);
  const url = CWA_BASE + resourceId + '?Authorization=' + _RAW_CWA_KEY + '&locationName=' + encodeURIComponent(normalized);
  const response = UrlFetchApp.fetch(url);
  const data = JSON.parse(response.getContentText());

  const locations = data.records.location;
  if (!locations || locations.length === 0) return `😥 找不到「${locationName}」的天氣資料，請確認地名正確（例如「臺北市」）`;

  const loc = locations[0];
  const elements = {};
  loc.weatherElement.forEach(el => {
    elements[el.elementName] = el.time;
  });

  const wxTimes = elements['Wx'] || [];
  const indices = [];
  for (let i = 0; i < wxTimes.length; i++) {
    if (!targetDate) { indices.push(i); continue; }
    const periodDate = Utilities.formatDate(new Date(wxTimes[i].startTime), 'GMT+8', 'yyyy-MM-dd');
    if (periodDate === targetDate) indices.push(i);
  }

  if (targetDate && indices.length === 0) return `😥 目前資料範圍內查不到 ${targetDate} 的預報`;

  let replyText = `🌤️ ${normalized} 天氣預報：\n`;
  indices.forEach(i => {
    const wx = elements['Wx'] ? elements['Wx'][i].parameter.parameterName : '';
    const pop = elements['PoP'] ? elements['PoP'][i].parameter.parameterName : '';
    const minT = elements['MinT'] ? elements['MinT'][i].parameter.parameterName : '';
    const maxT = elements['MaxT'] ? elements['MaxT'][i].parameter.parameterName : '';
    const ci = elements['CI'] ? elements['CI'][i].parameter.parameterName : '';
    const t = wxTimes[i];
    const startLabel = Utilities.formatDate(new Date(t.startTime), 'GMT+8', 'MM/dd HH:mm');
    const endLabel = Utilities.formatDate(new Date(t.endTime), 'GMT+8', 'HH:mm');
    replyText += `\n📅 ${startLabel}~${endLabel}\n☁️ ${wx}｜🌡️ ${minT}~${maxT}°C｜☔ 降雨${pop}%｜${ci}`;
  });

  return replyText;
}

function getWeatherToday(locationName, targetDate) {
  return getWeather('F-C0032-001', locationName, targetDate);
}

function getWeatherWeek(locationName, targetDate) {
  return getWeather('F-C0032-005', locationName, targetDate);
}

function resolveWeatherTargetDate(text) {
  const now = new Date();
  if (/明天/.test(text)) return Utilities.formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000), 'GMT+8', 'yyyy-MM-dd');
  if (/後天/.test(text)) return Utilities.formatDate(new Date(now.getTime() + 48 * 60 * 60 * 1000), 'GMT+8', 'yyyy-MM-dd');
  if (/今天|現在|今日/.test(text)) return Utilities.formatDate(now, 'GMT+8', 'yyyy-MM-dd');
  return null;
}

function getWeatherByDate(locationName, targetDate) {
  const short = getWeatherToday(locationName, targetDate);
  if (!short.startsWith('😥')) return short;
  return getWeatherWeek(locationName, targetDate);
}

// ── 汐止區天氣（晨報專用。這個資料集是PascalCase欄位：Locations/Location/WeatherElement/Time/ElementValue，
//    且locationName參數不會真的過濾，回傳新北市全部29區，要自己從陣列裡找汐止區）──
function getHsizhiWeather() {
  const url = CWA_BASE + 'F-D0047-071?Authorization=' + _RAW_CWA_KEY + '&locationName=' + encodeURIComponent('汐止區');
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  const data = JSON.parse(response.getContentText());

  const locationsGroup = data.records && data.records.Locations && data.records.Locations[0];
  const allLocations = locationsGroup && locationsGroup.Location;
  const loc = allLocations && allLocations.find(l => l.LocationName === '汐止區');
  if (!loc) {
    console.log('汐止天氣原始回應: ' + JSON.stringify(data).slice(0, 1500));
    return '😥 汐止天氣查詢失敗（資料格式跟預期不同，已把原始回應記到執行記錄）';
  }

  const elements = {};
  loc.WeatherElement.forEach(el => { elements[el.ElementName] = el.Time; });

  const wxTimes = elements['天氣現象'] || [];
  if (wxTimes.length === 0) {
    console.log('汐止天氣原始回應: ' + JSON.stringify(data).slice(0, 1500));
    return '😥 汐止天氣查詢失敗（抓不到天氣現象資料）';
  }

  const pick = (elementName, timeIndex, field) => {
    const times = elements[elementName];
    const values = times && times[timeIndex] && times[timeIndex].ElementValue;
    return values && values[0] ? values[0][field] : '';
  };

  let msg = `🌤️ 汐止區天氣：`;
  const count = Math.min(2, wxTimes.length);
  for (let i = 0; i < count; i++) {
    const t = wxTimes[i];
    const startLabel = Utilities.formatDate(new Date(t.StartTime), 'GMT+8', 'MM/dd HH:mm');
    const endLabel = Utilities.formatDate(new Date(t.EndTime), 'GMT+8', 'HH:mm');
    const wx = pick('天氣現象', i, 'Weather');
    const minT = pick('最低溫度', i, 'MinTemperature');
    const maxT = pick('最高溫度', i, 'MaxTemperature');
    const pop = pick('12小時降雨機率', i, 'ProbabilityOfPrecipitation');
    const popLabel = (pop && pop !== '-') ? `｜☔ 降雨${pop}%` : '';
    msg += `\n\n📅 ${startLabel}~${endLabel}\n☁️ ${wx}｜🌡️ ${minT}~${maxT}°C${popLabel}`;
  }
  return msg;
}

// ── 新北市天氣示警（晨報專用，沒有生效中的示警就回傳null，晨報會自動跳過這段）──
function getNewTaipeiAlert() {
  const url = CWA_BASE + 'W-C0033-001?Authorization=' + _RAW_CWA_KEY + '&locationName=' + encodeURIComponent('新北市');
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  const data = JSON.parse(response.getContentText());

  const locations = data.records && data.records.location;
  const loc = locations && locations[0];
  if (!loc) {
    console.log('新北市示警原始回應: ' + JSON.stringify(data).slice(0, 1500));
    return null;
  }

  const hazards = loc.hazardConditions && loc.hazardConditions.hazards;
  if (!hazards || hazards.length === 0) return null;

  let msg = `⚠️ 新北市目前有天氣示警：`;
  hazards.forEach(h => {
    // 官方schema沒明確標示hazards裡的物件有沒有再包一層info，兩種都吃
    const info = h.info || h;
    msg += `\n- ${info.phenomena || ''}${info.significance || ''}`;
  });
  return msg;
}

const WORKER_URL = 'https://law-proxy.oscarclon1112.workers.dev/';

function reverseGeocodeCity(lat, lon) {
  const url = `${WORKER_URL}?lat=${lat}&lon=${lon}`;
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) return null;
  const data = JSON.parse(response.getContentText());
  return data.ok && data.city ? normalizeCityName(data.city) : null;
}

// ==========================================
// 🎨 Gemini 生圖
// ==========================================
function generateImage(promptText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${_RAW_GEMINI_KEY}`;
  const payload = { contents: [{ parts: [{ text: promptText }] }] };
  const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true };
  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  const parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
  if (!parts) throw new Error('生圖失敗：' + JSON.stringify(data).slice(0, 200));
  const imagePart = parts.find(p => p.inlineData || p.inline_data);
  if (!imagePart) throw new Error('生圖失敗：回應中沒有圖片資料');
  const inline = imagePart.inlineData || imagePart.inline_data;
  return { mimeType: inline.mimeType || inline.mime_type, data: inline.data };
}

function uploadImageToWorker(base64Data, mimeType) {
  const url = WORKER_URL + 'upload';
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ data: base64Data, mimeType: mimeType }),
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  if (!data.ok) throw new Error('圖片上傳失敗：' + data.error);
  return data.url;
}

function handleImageGeneration(promptText) {
  try {
    const img = generateImage(promptText);
    const imageUrl = uploadImageToWorker(img.data, img.mimeType);
    return { ok: true, url: imageUrl };
  } catch (err) {
    console.log('生圖流程失敗: ' + err.toString());
    return { ok: false, error: err.toString() };
  }
}

function replyImageMessage(replyToken, imageUrl) {
  const response = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _RAW_LINE_TOKEN },
    payload: JSON.stringify({
      replyToken: replyToken,
      messages: [{ type: 'image', originalContentUrl: imageUrl, previewImageUrl: imageUrl }]
    }),
    muteHttpExceptions: true
  });
  try {
    const data = JSON.parse(response.getContentText());
    const sentId = data.sentMessages && data.sentMessages[0] && data.sentMessages[0].id;
    if (sentId) {
      CacheService.getScriptCache().put('msg_' + sentId, '[傳送了一張生成的圖片]', 21600);
    }
  } catch (err) {
    console.log('記錄圖片訊息ID失敗: ' + err.toString());
  }
}

// ==========================================
// 📷 圖片閒聊（不是名片也不是行程海報時）
// ==========================================
function chatAboutImage(base64Image) {
  const prompt = `${SECRETARY_PERSONA}\n\n使用者傳了一張圖片給你看，不是名片也不是行程海報，單純想跟你分享聊天。請用這個人設自然回應這張圖片的內容，像朋友傳照片給你看、你自然回話一樣，不要分段、不要括號注解，繁體中文，控制在100字以內。`;
  try {
    return callGeminiVision(prompt, base64Image, 0.55);
  } catch (err) {
    console.log('圖片閒聊失敗: ' + err.toString());
    return "😏 這張圖片我看得有點模糊，你說說看裡面是什麼？";
  }
}

// ==========================================
// ⚖️ 全國法規資料庫查詢
// ==========================================
const LAW_REGISTRY_URL = 'https://raw.githubusercontent.com/Oscar-Hsiao/Oscar-Hsiao.github.io/main/law-registry-common.json';
const LAW_INDEX_FULL_URL = 'https://raw.githubusercontent.com/Oscar-Hsiao/Oscar-Hsiao.github.io/main/law-index-full.json';

function getLawRegistry() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('law_registry');
  if (cached) return JSON.parse(cached);

  const data = JSON.parse(UrlFetchApp.fetch(LAW_REGISTRY_URL).getContentText());
  const records = data.records;
  cache.put('law_registry', JSON.stringify(records), 3600);
  return records;
}

function getFullLawIndex() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('law_index_full');
  if (cached) return JSON.parse(cached);

  const data = JSON.parse(UrlFetchApp.fetch(LAW_INDEX_FULL_URL).getContentText());
  const names = data.names;
  cache.put('law_index_full', JSON.stringify(names), 21600);
  return names;
}

function queryLawTopic(description) {
  const registry = getLawRegistry();
  const nameList = Object.entries(registry).map(([pcode, info]) => `${pcode}:${info.name}`).join('\n');

  const matchPrompt = `以下是可查詢的法規清單（格式為 代碼:名稱）：\n${nameList}\n\n使用者說：「${description}」\n請判斷使用者要查哪一部法規（不用管條號，只要判斷是哪部法規）。只輸出合法 JSON，不要包含 markdown 標記，格式：\n{"pcode":"符合的代碼，找不到就空字串"}`;

  let pcode;
  try {
    pcode = callGeminiJSON(matchPrompt, 0.0).pcode;
  } catch (err) {
    return "😥 法規比對失敗，請講清楚一點想查哪部法規";
  }

  if (!pcode || !registry[pcode]) return "😥 找不到符合的法規，換個名稱再試試看";

  const name = registry[pcode].name;

  try {
    const proxyUrl = `${WORKER_URL}?pcode=${encodeURIComponent(pcode)}`;
    const response = UrlFetchApp.fetch(proxyUrl, { muteHttpExceptions: true });
    const result = JSON.parse(response.getContentText());
    if (!result.ok || !result.articles || result.articles.length === 0) {
      return "😥 查詢失敗，法規資料庫暫時連不上或這部法規查無條文";
    }

    const articleSummaries = result.articles.map(a => `第${a.no}條：${a.text.slice(0, 60)}`).join('\n');
    const pickPrompt = `以下是《${name}》所有條文的開頭摘要：\n${articleSummaries}\n\n使用者想查的主題是：「${description}」\n請找出最相關的條號（最多5條，依相關程度排序）。只輸出合法 JSON，不要包含 markdown 標記，格式：\n{"nos":["條號1","條號2"]}`;
    const pickResult = callGeminiJSON(pickPrompt, 0.0);
    const nos = (pickResult.nos || []).map(String);

    if (nos.length === 0) return `😥 在《${name}》裡找不到跟這個主題相關的條文`;

    const matched = result.articles.filter(a => nos.includes(String(a.no)));
    if (matched.length === 0) return `😥 在《${name}》裡找不到跟這個主題相關的條文`;

    let replyText = `⚖️ ${name}相關條文：\n`;
    matched.forEach(a => {
      replyText += `\n第${a.no}條\n${a.text}\n`;
    });
    replyText += `\n🔗 ${result.sourceUrl}`;
    return replyText;
  } catch (err) {
    console.log(err.toString());
    return "😥 查詢失敗，可能是法規資料庫暫時連不上";
  }
}

function queryLaw(description) {
  const registry = getLawRegistry();
  const nameList = Object.entries(registry).map(([pcode, info]) => `${pcode}:${info.name}`).join('\n');

  const prompt = `以下是可查詢的法規清單（格式為 代碼:名稱）：\n${nameList}\n\n使用者說：「${description}」\n請判斷使用者要查哪一部法規，以及有沒有指定條號。條號如果使用者是用中文數字寫的（例如「第三條」「第十二條」），請轉換成阿拉伯數字（3、12）再輸出。只輸出合法 JSON，不要包含 markdown 標記，格式：\n{"pcode":"符合的代碼，找不到就空字串","flno":"條號數字（一律用阿拉伯數字），沒指定就空字串"}`;

  let pcode, flno;
  try {
    const parsed = callGeminiJSON(prompt, 0.0);
    pcode = parsed.pcode;
    flno = parsed.flno;
  } catch (err) {
    return "😥 法規比對失敗，請講清楚一點，例如：職業安全衛生法第5條";
  }

  if (pcode && registry[pcode]) {
    return formatLawResult(pcode, registry[pcode].name, flno, '');
  }

  // 常用清單找不到，改用完整索引做情境反查（一個情境可能橫跨多部法規，最多列3個候選）
  try {
    const fullIndex = getFullLawIndex();
    const fullNameList = Object.entries(fullIndex).map(([pc, name]) => `${pc}:${name}`).join('\n');
    const fullPrompt = `以下是全國法規完整清單（格式為 代碼:名稱）：\n${fullNameList}\n\n使用者描述的情境是：「${description}」\n請判斷這個情境最可能適用哪些法規（最多3個，依相關程度排序，只有一個相關就只列一個），以及各自可能的條號（不確定條號可以留空）。條號如果是中文數字，請轉換成阿拉伯數字。只輸出合法 JSON，不要包含 markdown 標記，格式：\n{"candidates":[{"pcode":"代碼","flno":"可能的條號（阿拉伯數字），不確定就空字串"}]}`;
    const fullParsed = callGeminiJSON(fullPrompt, 0.0);
    const candidates = (fullParsed.candidates || []).filter(c => c.pcode && fullIndex[c.pcode]);

    if (candidates.length === 0) return "😥 找不到符合的法規，換個名稱或講清楚一點情境再試試看";

    const disclaimer = '\n\n⚠️ 以上是AI依情境推測的相關法規，正式引用前請自行核對或諮詢專業意見';
    const results = candidates.map(c => formatLawResult(c.pcode, fullIndex[c.pcode], c.flno, ''));
    return results.join('\n\n---\n\n') + disclaimer;
  } catch (err) {
    console.log('完整索引反查失敗: ' + err.toString());
    return "😥 查詢失敗，可能是法規資料庫暫時連不上";
  }
}

// 依 pcode/flno 抓取並格式化單一法規（或單一條文）的回覆文字，供精準查詢與情境反查共用
function formatLawResult(pcode, name, flno, disclaimer) {
  if (!flno) {
    const url = 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=' + encodeURIComponent(pcode);
    return `⚖️ ${name}\n請指定條號查詢，例如：${name}第5條\n\n🔗 ${url}${disclaimer || ''}`;
  }
  try {
    const proxyUrl = `${WORKER_URL}?pcode=${encodeURIComponent(pcode)}&flno=${encodeURIComponent(flno)}`;
    const response = UrlFetchApp.fetch(proxyUrl, { muteHttpExceptions: true });
    const result = JSON.parse(response.getContentText());
    if (!result.ok) return `⚖️ ${name}\n😥 第${flno}條查詢失敗，可能是條號不存在或法規資料庫暫時連不上`;
    return `⚖️ ${result.name || name} 第${flno}條\n\n${result.article.text}\n\n🔗 ${result.sourceUrl}${disclaimer || ''}`;
  } catch (err) {
    console.log(err.toString());
    return `⚖️ ${name}\n😥 第${flno}條查詢失敗，可能是條號不存在或法規資料庫暫時連不上`;
  }
}

// ==========================================
// 📖 法規總表瀏覽（總表→選擇→目錄→逐條，全程不經過AI比對，選了就是選了）
// ==========================================
function buildLawListMessage() {
  const registry = getLawRegistry();
  const entries = Object.entries(registry);
  let msg = `⚖️ 法規總表（共${entries.length}部）：\n`;
  entries.forEach(([pcode, info], i) => {
    msg += `\n${i + 1}. ${info.name}`;
  });
  msg += `\n\n回覆數字選擇要查的法規，例如「1」`;
  return msg;
}

function selectLawByIndex(index) {
  const registry = getLawRegistry();
  const entries = Object.entries(registry);
  if (index < 1 || index > entries.length) return `😥 請輸入 1~${entries.length} 之間的數字`;

  const [pcode, info] = entries[index - 1];
  CacheService.getScriptCache().put('current_law', JSON.stringify({ pcode, name: info.name }), 600);
  return `⚖️ 已選定《${info.name}》（最新修正日期：${info.mod || '未知'}）\n\n回覆「法規內容」看目錄，或直接說「第X條」查詢條文`;
}

function lawTableOfContents(pcode, name) {
  try {
    const proxyUrl = `${WORKER_URL}?pcode=${encodeURIComponent(pcode)}`;
    const response = UrlFetchApp.fetch(proxyUrl, { muteHttpExceptions: true });
    const result = JSON.parse(response.getContentText());
    if (!result.ok || !result.articles || result.articles.length === 0) {
      return "😥 查詢失敗，法規資料庫暫時連不上或這部法規查無條文";
    }

    const chapterRanges = [];
    result.articles.forEach(a => {
      const last = chapterRanges[chapterRanges.length - 1];
      if (last && last.chapter === a.chapter) {
        last.to = a.no;
      } else {
        chapterRanges.push({ chapter: a.chapter, from: a.no, to: a.no });
      }
    });

    let msg = `⚖️ ${name} 目錄（共${result.articles.length}條）：\n`;
    if (chapterRanges.length === 1 && !chapterRanges[0].chapter) {
      msg += `\n第${chapterRanges[0].from}條 ~ 第${chapterRanges[0].to}條`;
    } else {
      chapterRanges.forEach(c => {
        msg += `\n${c.chapter || '（無章節）'}（第${c.from}條~第${c.to}條）`;
      });
    }
    msg += `\n\n回覆「第X條」查看該條內容`;
    return msg;
  } catch (err) {
    console.log(err.toString());
    return "😥 查詢失敗，可能是法規資料庫暫時連不上";
  }
}

// ==========================================
// 📇 名片建檔（需確認）
// ==========================================
function proposeAddCard(cardData) {
  CacheService.getScriptCache().put('pending_action', JSON.stringify({ type: 'add_card', cardData: cardData }), 300);
  return `📇 辨識出以下資訊，確認要建檔嗎？\n🏢 公司：${cardData.company}\n👤 姓名：${cardData.name}（${cardData.title}）\n📞 電話：${cardData.phone}\n✉️ Email：${cardData.email}\n\n回覆「確認」執行，或不理會自動取消`;
}

function getContactSheet() {
  const ss = SpreadsheetApp.openById(_RAW_SHEET_ID);
  let sheet = ss.getSheetByName("CRM總表");
  if (!sheet) {
    sheet = ss.insertSheet("CRM總表");
    sheet.appendRow(["建檔時間", "公司", "姓名", "職稱", "手機", "Email", "原始照片", "備註"]);
  } else {
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (header.indexOf('備註') === -1) sheet.getRange(1, header.length + 1).setValue('備註');
  }
  return sheet;
}

function saveContactCard(cardData) {
  const sheet = getContactSheet();
  sheet.appendRow([new Date(), cardData.company, cardData.name, cardData.title, "'" + cardData.phone, cardData.email, cardData.imageUrl || '', '']);
  return `✅ 名片建檔成功！\n🏢 公司：${cardData.company}\n👤 姓名：${cardData.name} (${cardData.title})\n📞 電話：${cardData.phone}`;
}

// ==========================================
// 🔍 查詢聯絡人
// ==========================================
function searchContact(keyword) {
  const sheet = getContactSheet();
  if (sheet.getLastRow() < 2) return "📭 目前還沒有任何聯絡人資料，請先傳名片建檔。";

  const rows = sheet.getDataRange().getValues().slice(1);
  const lowerKeyword = keyword.toLowerCase();

  const matches = rows.filter(row => {
    const company = String(row[1] || '').toLowerCase();
    const name = String(row[2] || '').toLowerCase();
    const note = String(row[7] || '').toLowerCase();
    return company.includes(lowerKeyword) || name.includes(lowerKeyword) || note.includes(lowerKeyword);
  });

  if (matches.length === 0) return `😥 找不到符合「${keyword}」的聯絡人`;

  const shown = matches.slice(0, 5);
  let replyText = `🔍 找到 ${matches.length} 筆符合「${keyword}」的結果：\n`;
  shown.forEach((row, i) => {
    replyText += `\n${i + 1}. 👤 ${row[2]}（${row[1]}）\n   ${row[3] || '職稱未填'} | 📞 ${row[4]} | ✉️ ${row[5]}${row[7] ? '\n   📝 ' + row[7] : ''}`;
  });
  if (matches.length > 5) replyText += `\n\n...還有 ${matches.length - 5} 筆，請輸入更精確的關鍵字`;

  return replyText;
}

function listAllContacts() {
  const sheet = getContactSheet();
  if (sheet.getLastRow() < 2) return "📭 目前還沒有任何聯絡人資料，請先傳名片建檔。";
  const rows = sheet.getDataRange().getValues().slice(1);
  let msg = `📇 名片總表（共${rows.length}筆）：`;
  rows.forEach((row, i) => {
    msg += `\n${i + 1}. ${row[2]}（${row[1]}）📞 ${row[4]}`;
  });
  return msg;
}

function addContactNote(keyword, note) {
  const sheet = getContactSheet();
  if (sheet.getLastRow() < 2) return "📭 目前還沒有任何聯絡人資料，請先傳名片建檔。";

  const data = sheet.getDataRange().getValues();
  const lowerKeyword = keyword.toLowerCase();
  const matchRows = [];
  for (let i = 1; i < data.length; i++) {
    const company = String(data[i][1] || '').toLowerCase();
    const name = String(data[i][2] || '').toLowerCase();
    if (company.includes(lowerKeyword) || name.includes(lowerKeyword)) matchRows.push(i);
  }

  if (matchRows.length === 0) return `😥 找不到符合「${keyword}」的聯絡人，備註新增失敗`;
  if (matchRows.length > 1) {
    const list = matchRows.map(i => `${data[i][2]}（${data[i][1]}）`).join('、');
    return `🔍 找到多筆符合「${keyword}」的聯絡人：${list}\n請輸入更精確的關鍵字（例如公司全名）再備註一次`;
  }

  const i = matchRows[0];
  sheet.getRange(i + 1, 8).setValue(note);
  return `📝 已幫 ${data[i][2]}（${data[i][1]}）補上備註：${note}`;
}

// ==========================================
// 🧠 秘書長期記憶（第二層）
// ==========================================
function getMemorySheet() {
  const ss = SpreadsheetApp.openById(_RAW_SHEET_ID);
  let sheet = ss.getSheetByName("秘書記憶");
  if (!sheet) {
    sheet = ss.insertSheet("秘書記憶");
    sheet.appendRow(["時間", "內容"]);
  }
  return sheet;
}

function saveMemory(content) {
  getMemorySheet().appendRow([new Date(), content]);
}

function getLongTermMemoryText() {
  const sheet = getMemorySheet();
  if (sheet.getLastRow() < 2) return '';
  const rows = sheet.getDataRange().getValues().slice(1);
  return rows.slice(-50).map(r => `- ${r[1]}`).join('\n');
}

function forgetMemory(keyword) {
  const sheet = getMemorySheet();
  let deletedCount = 0;
  if (sheet.getLastRow() >= 2) {
    const data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][1]).includes(keyword)) {
        sheet.deleteRow(i + 1);
        deletedCount++;
      }
    }
  }

  const cache = CacheService.getScriptCache();
  const historyRaw = cache.get('chat_history');
  let clearedFromShortTerm = false;
  if (historyRaw) {
    const history = JSON.parse(historyRaw);
    const filtered = history.filter(h => !h.user.includes(keyword) && !h.bot.includes(keyword));
    if (filtered.length !== history.length) {
      cache.put('chat_history', JSON.stringify(filtered), 1800);
      clearedFromShortTerm = true;
    }
  }

  if (deletedCount === 0 && !clearedFromShortTerm) return `😥 找不到包含「${keyword}」的記憶`;
  return `🗑️ 已經把跟「${keyword}」有關的記憶都忘掉了（長期記憶${deletedCount > 0 ? '刪了' + deletedCount + '筆' : '沒有'}，最近對話${clearedFromShortTerm ? '也清了' : '沒有相關內容'}）`;
}

// ==========================================
// 😏 秘書人設閒聊（人設 + 長期記憶 + 短期對話三層）
// ==========================================
function chatWithPersona(text, quotedContext) {
  const props = PropertiesService.getScriptProperties();

  const nicknameMatch = text.match(/(?:以後|之後)?(?:叫我|稱呼我)([一-龥A-Za-z0-9]{1,10})/);
  if (nicknameMatch) {
    props.setProperty('user_nickname', nicknameMatch[1]);
    saveMemory(`使用者希望被稱呼為「${nicknameMatch[1]}」`);
    return `好，${nicknameMatch[1]}，以後就這樣叫你囉😏`;
  }

  const rememberMatch = text.match(/^(?:記住|記得)(.+)/);
  if (rememberMatch) {
    saveMemory(rememberMatch[1].trim());
    return `記住了，這件事我不會忘😏`;
  }

  const forgetMatch = text.match(/^小蜜忘記(.+)/);
  if (forgetMatch) {
    return forgetMemory(forgetMatch[1].trim());
  }

  const nickname = props.getProperty('user_nickname') || 'Oscar';
  const longTermMemory = getLongTermMemoryText();

  const cache = CacheService.getScriptCache();
  const historyRaw = cache.get('chat_history');
  const history = historyRaw ? JSON.parse(historyRaw) : [];
  const historyText = history.map(h => `使用者：${h.user}\n秘書：${h.bot}`).join('\n');

  const todayLabel = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd (EEEE)');
  const prompt = `${SECRETARY_PERSONA}\n\n今天實際日期是 ${todayLabel}，如果使用者問今天星期幾、幾號之類的問題，用這個真實日期回答，不要用猜的。\n\n你稱呼使用者為「${nickname}」，回覆時自然地用這個稱呼帶入。\n\n${longTermMemory ? '你記得關於使用者的長期資訊：\n' + longTermMemory + '\n\n' : ''}${historyText ? '之前的對話：\n' + historyText + '\n\n' : ''}${quotedContext ? '使用者這句話是在引用回覆你之前說過的這句話：「' + quotedContext + '」，請針對這句話回答使用者的問題，不要離題。\n\n' : ''}使用者現在說：「${text}」\n\n請完成兩件事，只輸出合法 JSON：\n1. "reply"：用這個人設自然回覆一段話，不要分段、不要括號註解，繁體中文，控制在 100 字以內\n2. "memory"：這句話裡如果包含值得長期記住的事（偏好、計畫、重要資訊等），濃縮成一句話放這裡；只是單純閒聊就放 null\n\n格式：{"reply":"...","memory":"...或null"}`;

  let result;
  try {
    result = callGeminiJSON(prompt, 0.55);
  } catch (err) {
    console.log('閒聊呼叫失敗: ' + err.toString());
    return "😏 我這邊有點恍神，你再說一次？";
  }

  if (result.memory && result.memory !== 'null') saveMemory(result.memory);

  history.push({ user: text, bot: result.reply });
  cache.put('chat_history', JSON.stringify(history.slice(-10)), 1800);

  return result.reply;
}

// ==========================================
// 📰 抓取 RSS 新聞
// ==========================================
function fetchNewsRSS(url, count) {
  const response = UrlFetchApp.fetch(url);
  const xml = XmlService.parse(response.getContentText());
  const channel = xml.getRootElement().getChild('channel');
  const items = channel.getChildren('item').slice(0, count);
  return items.map(item => ({
    title: item.getChildText('title'),
    link: item.getChildText('link')
  }));
}

function getStockNews() {
  const items = fetchNewsRSS('https://tw.stock.yahoo.com/rss?category=tw-market', 5);
  CacheService.getScriptCache().put('last_news', JSON.stringify(items), 3600);
  let replyText = `📈 今日台股新聞（前 ${items.length} 則）：\n`;
  items.forEach((item, i) => {
    replyText += `\n${i + 1}. ${item.title}`;
  });
  replyText += `\n\n想看哪則的網址，跟我說「第X則網址」`;
  return replyText;
}

function getAINews() {
  const items = fetchNewsRSS('https://technews.tw/category/ai/feed/', 5);
  CacheService.getScriptCache().put('last_news', JSON.stringify(items), 3600);
  let replyText = `🤖 今日 AI 新聞（前 ${items.length} 則）：\n`;
  items.forEach((item, i) => {
    replyText += `\n${i + 1}. ${item.title}`;
  });
  replyText += `\n\n想看哪則的網址，跟我說「第X則網址」`;
  return replyText;
}

function getNewsLink(index) {
  const cached = CacheService.getScriptCache().get('last_news');
  if (!cached) return "😥 沒有最近查過的新聞清單，先查一次新聞吧";
  const items = JSON.parse(cached);
  if (index < 1 || index > items.length) return `😥 請輸入 1~${items.length} 之間的數字`;
  return `🔗 ${items[index - 1].title}\n${items[index - 1].link}`;
}

// ==========================================
// 🎬 YouTube 影片摘要
// ==========================================
function summarizeYouTube(url) {
  const videoIdMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!videoIdMatch) return "😥 看不出這是 YouTube 連結";
  const videoId = videoIdMatch[1];

  let transcript;
  try {
    transcript = getYouTubeTranscript(videoId);
  } catch (err) {
    console.log(err.toString());
    return "😥 這支影片抓不到字幕（可能沒開字幕），沒辦法幫你摘要內容";
  }

  if (!transcript) return "😥 這支影片抓不到字幕（可能沒開字幕），沒辦法幫你摘要內容";

  const prompt = `以下是一支 YouTube 影片的完整字幕逐字稿，請幫我摘要這支影片在講什麼，用條列式列出重點，繁體中文，控制在 300 字以內：\n\n${transcript.slice(0, 15000)}`;
  return callGeminiText(prompt);
}

function getYouTubeTranscript(videoId) {
  const pageHtml = UrlFetchApp.fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { 'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8' }
  }).getContentText();

  const match = pageHtml.match(/"captionTracks":(\[.*?\])(?=,"(?:audioTracks|translationLanguages))/);
  if (!match) return null;

  const tracks = JSON.parse(match[1]);
  if (!tracks || tracks.length === 0) return null;

  const preferred = tracks.find(t => /zh/i.test(t.languageCode)) || tracks[0];
  const xmlText = UrlFetchApp.fetch(preferred.baseUrl).getContentText();
  const doc = XmlService.parse(xmlText);
  const textNodes = doc.getRootElement().getChildren('text');

  return textNodes.map(node => node.getText()).join(' ')
    .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim();
}

// ==========================================
// 🌐 一般網頁摘要
// ==========================================
function summarizeWebpage(url) {
  let html;
  try {
    html = UrlFetchApp.fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).getContentText();
  } catch (err) {
    return "😥 抓不到這個網頁，可能連結有誤或該網站擋爬蟲";
  }

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return "😥 這個網頁抓不到內容";

  const prompt = `以下是一個網頁去除標籤後的純文字內容，請幫我摘要這個網頁在講什麼，繁體中文，控制在 200 字以內：\n\n${text.slice(0, 15000)}`;
  return callGeminiText(prompt);
}

// ==========================================
// 📅 新增行程
// ==========================================
function addScheduleFromText(description) {
  const today = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd (EEEE)');
  const prompt = `今天是 ${today}。請從下面這句話萃取行程資訊，換算成實際日期時間。
請務必只輸出合法 JSON，不要包含 markdown 標記，格式如下：
{"title":"行程標題","date":"YYYY-MM-DD","endDate":"如果是跨日活動，填結束日期YYYY-MM-DD；單日活動就留空字串","startTime":"HH:mm","endTime":"HH:mm","location":"地點，沒有就空字串"}
如果沒提到結束時間，預設開始時間後 1 小時。
句子：「${description}」`;

  try {
    const aiResult = callGeminiText(prompt);
    const eventData = JSON.parse(aiResult);
    if (!eventData.title || !eventData.date) {
      return "😥 沒抓到明確的行程內容，請講清楚一點日期跟時間，例如： 明天下午3點跟客戶在公司開會";
    }
    return proposeAddSchedule(eventData);
  } catch (err) {
    return "😥 行程解析失敗，請講清楚一點日期跟時間，例如： 明天下午3點跟客戶在公司開會";
  }
}

function proposeAddSchedule(eventData) {
  CacheService.getScriptCache().put('pending_action', JSON.stringify({ type: 'add', eventData: eventData }), 300);
  const endDateStr = eventData.endDate || eventData.date;
  const isMultiDay = endDateStr !== eventData.date;
  const dateLabel = isMultiDay
    ? `${eventData.date} ~ ${endDateStr}`
    : `${eventData.date} ${eventData.startTime || ''}~${eventData.endTime || ''}`;
  return `📝 確認要新增這筆行程嗎？\n📌 ${eventData.title}\n📅 ${dateLabel}\n📍 ${eventData.location || '未指定地點'}\n\n回覆「確認」執行，或不理會自動取消`;
}

function createCalendarEvent(eventData) {
  const cal = CalendarApp.getDefaultCalendar();
  const endDateStr = eventData.endDate || eventData.date;
  const isMultiDay = endDateStr !== eventData.date;
  const isAllDay = isMultiDay && !eventData.startTime && !eventData.endTime;

  if (isAllDay) {
    const startDate = new Date(`${eventData.date}T00:00:00`);
    const endDateExclusive = new Date(`${endDateStr}T00:00:00`);
    endDateExclusive.setDate(endDateExclusive.getDate() + 1);
    cal.createAllDayEvent(eventData.title, startDate, endDateExclusive, { location: eventData.location || '' });
  } else {
    const start = new Date(`${eventData.date}T${eventData.startTime || '09:00'}:00`);
    const end = new Date(`${endDateStr}T${eventData.endTime || '10:00'}:00`);
    cal.createEvent(eventData.title, start, end, { location: eventData.location || '' });
  }

  const dateLabel = isMultiDay
    ? `${eventData.date} ~ ${endDateStr}`
    : `${eventData.date} ${eventData.startTime || ''}~${eventData.endTime || ''}`;
  return `✅ 行程已加入日曆！\n📌 ${eventData.title}\n📅 ${dateLabel}\n📍 ${eventData.location || '未指定地點'}`;
}

// ==========================================
// 🗑️ 刪除行程
// ==========================================
function deleteSchedule(description) {
  const today = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd (EEEE)');
  const prompt = `今天是 ${today}。請從下面這句話萃取出要刪除的行程資訊：日期、時間（如果有提到）、關鍵字（去掉日期時間字眼後剩下的地點/事件/人名，沒有就空字串）。
請務必只輸出合法 JSON，不要包含 markdown 標記，格式如下：
{"date":"YYYY-MM-DD 或空字串","time":"HH:mm 或空字串","keyword":"關鍵字或空字串"}
句子：「${description}」`;

  let date, time, keyword;
  try {
    const aiResult = callGeminiText(prompt);
    const parsed = JSON.parse(aiResult);
    date = parsed.date;
    time = parsed.time;
    keyword = parsed.keyword;
  } catch (err) {
    return "😥 行程解析失敗，請講清楚一點，例如：刪除 深坑老街 或 刪除明天下午四點的行程";
  }

  const cal = CalendarApp.getDefaultCalendar();
  let start, end;
  if (date) {
    start = new Date(`${date}T00:00:00`);
    end = new Date(`${date}T23:59:59`);
  } else {
    const now = new Date();
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    end = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  }

  let events = cal.getEvents(start, end);
  if (time) {
    events = events.filter(e => Utilities.formatDate(e.getStartTime(), 'GMT+8', 'HH:mm') === time);
  } else if (keyword) {
    events = events.filter(e => e.getTitle().includes(keyword));
  }

  if (events.length === 0) return `😥 找不到符合的行程`;

  if (date && !time && !keyword && events.length > 1) {
    const targets = events.map(ev => ({ title: ev.getTitle(), start: ev.getStartTime().toISOString() }));
    CacheService.getScriptCache().put('pending_action', JSON.stringify({ type: 'clear', targets: targets }), 300);
    const list = events.map((ev, i) => `${i + 1}. ${ev.getTitle()}`).join('\n');
    return `🗑️ 確認要清空 ${date} 的 ${events.length} 筆行程嗎？\n${list}\n\n回覆「確認」執行，或不理會自動取消`;
  }

  if (events.length === 1) {
    const ev = events[0];
    const info = `📌 ${ev.getTitle()}\n📅 ${Utilities.formatDate(ev.getStartTime(), 'GMT+8', 'yyyy-MM-dd HH:mm')}`;
    CacheService.getScriptCache().put('pending_action', JSON.stringify({ type: 'delete', target: { title: ev.getTitle(), start: ev.getStartTime().toISOString() } }), 300);
    return `🗑️ 確認要刪除這筆行程嗎？\n${info}\n\n回覆「確認」執行，或不理會自動取消`;
  }

  const shown = events.slice(0, 5);
  const items = shown.map(ev => ({ title: ev.getTitle(), start: ev.getStartTime().toISOString() }));
  CacheService.getScriptCache().put('pending_delete', JSON.stringify(items), 300);

  let replyText = `🔍 找到 ${events.length} 筆符合的行程，請選擇更精確的關鍵字或時間刪除：\n`;
  shown.forEach((ev, i) => {
    replyText += `\n${i + 1}. ${ev.getTitle()}（${Utilities.formatDate(ev.getStartTime(), 'GMT+8', 'MM/dd HH:mm')}）`;
  });
  return replyText;
}

// ==========================================
// 🧹 清空某一天的所有行程
// ==========================================
function clearScheduleByDate(description) {
  const today = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd (EEEE)');
  const prompt = `今天是 ${today}。請從下面這句話萃取出「要清空哪一天」的日期，換算成實際日期。
請務必只輸出合法 JSON，不要包含 markdown 標記，格式如下：
{"date":"YYYY-MM-DD"}
句子：「${description}」`;

  let date;
  try {
    const aiResult = callGeminiText(prompt);
    date = JSON.parse(aiResult).date;
  } catch (err) {
    return "😥 日期解析失敗，請講清楚一點，例如：清空今天的行程 或 清空8/8的行程";
  }

  const cal = CalendarApp.getDefaultCalendar();
  const dayStart = new Date(`${date}T00:00:00`);
  const events = cal.getEventsForDay(dayStart);

  if (events.length === 0) return `📭 ${date} 沒有任何行程`;

  const targets = events.map(ev => ({ title: ev.getTitle(), start: ev.getStartTime().toISOString() }));
  CacheService.getScriptCache().put('pending_action', JSON.stringify({ type: 'clear', targets: targets }), 300);
  const list = events.map((ev, i) => `${i + 1}. ${ev.getTitle()}`).join('\n');
  return `🗑️ 確認要清空 ${date} 的 ${events.length} 筆行程嗎？\n${list}\n\n回覆「確認」執行，或不理會自動取消`;
}

function deleteEventByTitleAndStart(title, startISO) {
  const targetStart = new Date(startISO);
  const cal = CalendarApp.getDefaultCalendar();
  const searchStart = new Date(targetStart.getTime() - 60 * 1000);
  const searchEnd = new Date(targetStart.getTime() + 60 * 1000);
  const matches = cal.getEvents(searchStart, searchEnd).filter(e => e.getTitle() === title && e.getStartTime().getTime() === targetStart.getTime());
  if (matches.length === 0) return null;
  const ev = matches[0];
  const info = `📌 ${ev.getTitle()}\n📅 ${Utilities.formatDate(ev.getStartTime(), 'GMT+8', 'yyyy-MM-dd HH:mm')}`;
  ev.deleteEvent();
  return info;
}

function executePendingAction(pending) {
  if (pending.type === 'add') {
    return createCalendarEvent(pending.eventData);
  }
  if (pending.type === 'add_card') {
    return saveContactCard(pending.cardData);
  }
  if (pending.type === 'delete') {
    const info = deleteEventByTitleAndStart(pending.target.title, pending.target.start);
    return info ? `🗑️ 已刪除行程！\n${info}` : "😥 找不到這個行程，可能已經被刪除了";
  }
  if (pending.type === 'clear') {
    const titles = [];
    pending.targets.forEach(t => {
      const info = deleteEventByTitleAndStart(t.title, t.start);
      if (info) titles.push(t.title);
    });
    if (titles.length === 0) return "😥 找不到可刪除的行程，可能已經被刪除了";
    return `🗑️ 已清空 ${titles.length} 筆行程：\n${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
  }
  return "😥 不明的待處理動作";
}

function deleteScheduleByIndex(index) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('pending_delete');
  if (!cached) return "😥 沒有待確認的行程清單，請重新輸入刪除指令";

  const items = JSON.parse(cached);
  if (index < 1 || index > items.length) return `😥 請輸入 1~${items.length} 之間的數字`;

  const target = items[index - 1];
  CacheService.getScriptCache().put('pending_action', JSON.stringify({ type: 'delete', target: target }), 300);
  return `🗑️ 確認要刪除這筆行程嗎？\n📌 ${target.title}\n📅 ${Utilities.formatDate(new Date(target.start), 'GMT+8', 'yyyy-MM-dd HH:mm')}\n\n回覆「確認」執行，或不理會自動取消`;
}

// ==========================================
// 📋 查詢行程
// ==========================================
function queryScheduleByDate(description) {
  const today = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd (EEEE)');
  const prompt = `今天是 ${today}。請從下面這話萃取出要查詢哪一天，換算成實際日期。
請務必只輸出合法 JSON，不要包含 markdown 標記，格式如下：
{"date":"YYYY-MM-DD"}
句子：「${description}」`;

  let date;
  try {
    const aiResult = callGeminiText(prompt);
    date = JSON.parse(aiResult).date;
  } catch (err) {
    console.log(err.toString());
    return "😥 日期解析失敗，請講清楚一點，例如：8/8 或 明天";
  }

  const cal = CalendarApp.getDefaultCalendar();
  const dayStart = new Date(`${date}T00:00:00`);
  const events = cal.getEventsForDay(dayStart);

  if (events.length === 0) return `📭 ${date} 沒有任何行程`;

  const items = events.map(ev => ({ title: ev.getTitle(), start: ev.getStartTime().toISOString() }));
  CacheService.getScriptCache().put('pending_delete', JSON.stringify(items), 300);

  let replyText = `📅 ${date} 的行程（共 ${events.length} 筆）：\n`;
  events.forEach((ev, i) => {
    replyText += `\n${i + 1}. ${Utilities.formatDate(ev.getStartTime(), 'GMT+8', 'HH:mm')} ${ev.getTitle()}${ev.getLocation() ? '（' + ev.getLocation() + '）' : ''}`;
  });
  return replyText;
}

function queryScheduleByRange(description) {
  const today = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd (EEEE)');
  const prompt = `今天是 ${today}。請從下面這句話萃取出要查詢的日期區間（例如「下禮拜」代表下週一到下週日），換算成實際日期。
請務必只輸出合法 JSON，不要包含 markdown 標記，格式如下：
{"start":"YYYY-MM-DD","end":"YYYY-MM-DD"}
句子：「${description}」`;

  let start, end;
  try {
    const aiResult = callGeminiText(prompt);
    const parsed = JSON.parse(aiResult);
    start = parsed.start;
    end = parsed.end;
  } catch (err) {
    console.log(err.toString());
    return "😥 日期區間解析失敗，請講清楚一點，例如：這禮拜的行程 或 下禮拜有哪些行程";
  }

  const cal = CalendarApp.getDefaultCalendar();
  const rangeStart = new Date(`${start}T00:00:00`);
  const rangeEnd = new Date(`${end}T23:59:59`);
  const events = cal.getEvents(rangeStart, rangeEnd);

  if (events.length === 0) return `📭 ${start} ~ ${end} 沒有任何行程`;

  const items = events.map(ev => ({ title: ev.getTitle(), start: ev.getStartTime().toISOString() }));
  CacheService.getScriptCache().put('pending_delete', JSON.stringify(items), 300);

  let replyText = `📅 ${start} ~ ${end} 的行程（共 ${events.length} 筆）：\n`;
  events.forEach((ev, i) => {
    replyText += `\n${i + 1}. ${Utilities.formatDate(ev.getStartTime(), 'GMT+8', 'MM/dd HH:mm')} ${ev.getTitle()}${ev.getLocation() ? '（' + ev.getLocation() + '）' : ''}`;
  });
  return replyText;
}

// ==========================================
// 🌅 晨報 / 下午新聞（主動推播，靠時間觸發器排程執行）
// ==========================================
function getTodayScheduleSummary() {
  const cal = CalendarApp.getDefaultCalendar();
  const events = cal.getEventsForDay(new Date());
  if (events.length === 0) return '📭 今天沒有行程';
  let msg = `📅 今天的行程（共${events.length}筆）：`;
  events.forEach(ev => {
    msg += `\n${Utilities.formatDate(ev.getStartTime(), 'GMT+8', 'HH:mm')} ${ev.getTitle()}${ev.getLocation() ? '（' + ev.getLocation() + '）' : ''}`;
  });
  return msg;
}

function sendMorningBriefing() {
  const todayLabel = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd (EEEE)');
  let msg = `☀️ 老爺早安，今天是 ${todayLabel}`;

  try {
    msg += '\n\n' + getHsizhiWeather();
  } catch (err) {
    console.log('晨報天氣失敗: ' + err.toString());
    msg += '\n\n😥 汐止天氣查詢失敗';
  }

  try {
    const alert = getNewTaipeiAlert();
    if (alert) msg += '\n\n' + alert;
  } catch (err) {
    console.log('晨報示警失敗: ' + err.toString());
  }

  try {
    msg += '\n\n' + getTodayScheduleSummary();
  } catch (err) {
    console.log('晨報行程失敗: ' + err.toString());
    msg += '\n\n😥 行程查詢失敗';
  }

  try {
    msg += '\n\n' + getStockNews();
  } catch (err) {
    console.log('晨報新聞失敗: ' + err.toString());
    msg += '\n\n😥 股市新聞查詢失敗';
  }

  pushMessage(_RAW_ADMIN_USER_ID, msg);
}

function sendAfternoonAINews() {
  try {
    pushMessage(_RAW_ADMIN_USER_ID, getAINews());
  } catch (err) {
    console.log('下午新聞推播失敗: ' + err.toString());
  }
}

// 只需要在 Apps Script 編輯器手動執行「一次」，用來建立每天自動觸發的排程（重複執行也不會建立重複的，會先清掉舊的再建）
function setupDailyTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => {
    const fn = t.getHandlerFunction();
    if (fn === 'sendMorningBriefing' || fn === 'sendAfternoonAINews') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('sendMorningBriefing').timeBased().atHour(8).nearMinute(30).everyDays(1).create();
  ScriptApp.newTrigger('sendAfternoonAINews').timeBased().atHour(14).nearMinute(0).everyDays(1).create();
}
