const SUPABASE_URL = 'https://kalaeubsgfyvhecyyuti.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbGFldWJzZ2Z5dmhlY3l5dXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTgzNjExNSwiZXhwIjoyMTAxNDEyMTE1fQ.kaFCBDyprp4GmYSRGFxK1UI1y_KQgHNFEQHquVdvgFs';
const ADMIN_HASH = '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { hash, company_id, records } = payload;
    if (!hash || hash !== ADMIN_HASH) return respond({ ok: false, error: 'Unauthorized' });
    if (!company_id || !records || !records.length) return respond({ ok: false, error: 'Invalid payload' });
    const res = UrlFetchApp.fetch(
      SUPABASE_URL + '/rest/v1/law_records?on_conflict=company_id,category,law_code',
      {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': 'Bearer ' + SERVICE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        payload: JSON.stringify(records),
        muteHttpExceptions: true
      }
    );
    const code = res.getResponseCode();
    if (code === 200 || code === 201) return respond({ ok: true });
    return respond({ ok: false, error: res.getContentText().slice(0, 300) });
  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function testProxy() {
  const res = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/law_records?company_id=eq.oscar&select=company_id&limit=1', {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY }
  });
  Logger.log('HTTP ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 100));
  return res.getResponseCode();
}
