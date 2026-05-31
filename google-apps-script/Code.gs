/**
 * Iron Man Fitness Gym registration receiver.
 * Bind this script to a Google Sheet and deploy it as a web app.
 */
const SHEET_NAME = 'Membership Registrations';
const HEADERS = ['Submitted At', 'Name', 'Phone', 'Email', 'Plan', 'Source'];

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || '{}');
    const sheet = getRegistrationSheet_();
    sheet.appendRow([
      new Date(),
      safeCell_(payload.name),
      safeCell_(payload.phone),
      safeCell_(payload.email),
      safeCell_(payload.plan),
      safeCell_(payload.source || 'Website registration form')
    ]);

    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({ ok: false, error: error.message });
  }
}

function getRegistrationSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

function safeCell_(value) {
  const text = String(value || '').trim();
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
