// ==========================================
// 🚀 AI實作坊 名片識別機器人（完整版）
// ==========================================

const _RAW_LINE_TOKEN    = '';
const _RAW_ADMIN_USER_ID = '';
const _RAW_GEMINI_KEY    = '';
const _RAW_SHEET_ID      = '';

function doPost(e) {
  try {
    const event = JSON.parse(e.postData.contents).events[0];
    if (!event) return ContentService.createTextOutput("OK");

    const replyToken = event.replyToken;
    const userId = event.source.userId;
    const messageType = event.message.type;

    if (_RAW_ADMIN_USER_ID === '') {
      replyMessage(replyToken, "🎯 成功攔截您的系統 User ID！\n請複製以下亂碼填回最上方 _RAW_ADMIN_USER_ID 中：\n\n" + userId);
      return ContentService.createTextOutput("Success");
    }

    if (userId !== _RAW_ADMIN_USER_ID) return ContentService.createTextOutput("Unauthorized");

    if (messageType === 'image') {
      const messageId = event.message.id;
      const imageBase64 = getLineImageBase64(messageId);

      const prompt = `這張圖片是一張名片，請萃取以下資訊。
請務必只輸出合法 JSON，不要包含 markdown 標記：
{"company":"公司名","name":"姓名","title":"職稱","phone":"手機","email":"信箱"}`;

      const aiResult = callGeminiVision(prompt, imageBase64);
      const parsed = JSON.parse(aiResult);

      const replyText = proposeAddCard(parsed);
      replyMessage(replyToken, replyText);
      return ContentService.createTextOutput("Success");
    }

    if (messageType === 'text') {
      const text = event.message.text.trim();

      const pendingRaw = CacheService.getScriptCache().get('pending_action');
      if (pendingRaw && /^(確認|是|對|yes|ok|好|執行)$/i.test(text)) {
        const cardData = JSON.parse(pendingRaw).cardData;
        const replyText = saveContactCard(cardData);
        CacheService.getScriptCache().remove('pending_action');
        replyMessage(replyToken, replyText);
        return ContentService.createTextOutput("Success");
      }
      if (pendingRaw && /^(取消|不要|no)$/i.test(text)) {
        CacheService.getScriptCache().remove('pending_action');
        replyMessage(replyToken, "已取消");
        return ContentService.createTextOutput("Success");
      }

      replyMessage(replyToken, "請傳一張名片照片給我，我會幫你辨識建檔");
      return ContentService.createTextOutput("Success");
    }

  } catch (error) {
    console.log("Error: " + error.toString());
    return ContentService.createTextOutput("Error");
  }
}

// ==========================================
// 🔧 核心工具函式
// ==========================================
function replyMessage(replyToken, text) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _RAW_LINE_TOKEN },
    payload: JSON.stringify({ replyToken: replyToken, messages: [{ type: 'text', text: text }] })
  });
}

function getLineImageBase64(messageId) {
  const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;
  const response = UrlFetchApp.fetch(url, { headers: { 'Authorization': 'Bearer ' + _RAW_LINE_TOKEN } });
  return Utilities.base64Encode(response.getBlob().getBytes());
}

function callGeminiVision(prompt, base64Image) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${_RAW_GEMINI_KEY}`;
  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: "image/jpeg", data: base64Image } }
      ]
    }]
  };
  const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload) };
  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  let text = data.candidates[0].content.parts[0].text;
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

// ==========================================
// 📇 名片建檔（需確認）
// ==========================================
function proposeAddCard(cardData) {
  CacheService.getScriptCache().put('pending_action', JSON.stringify({ cardData: cardData }), 300);
  return `📇 辨識出以下資訊，確認要建檔嗎？\n🏢 公司：${cardData.company}\n👤 姓名：${cardData.name}（${cardData.title}）\n📞 電話：${cardData.phone}\n✉️ Email：${cardData.email}\n\n回覆「確認」執行，或不理會自動取消`;
}

function saveContactCard(cardData) {
  const ss = SpreadsheetApp.openById(_RAW_SHEET_ID);
  let sheet = ss.getSheetByName("CRM總表");
  if (!sheet) {
    sheet = ss.insertSheet("CRM總表");
    sheet.appendRow(["建檔時間", "公司", "姓名", "職稱", "手機", "Email"]);
  }
  sheet.appendRow([new Date(), cardData.company, cardData.name, cardData.title, "'" + cardData.phone, cardData.email]);
  return `✅ 名片建檔成功！`;
}
