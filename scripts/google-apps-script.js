/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  DMHS Reunion – Google Sheets Integration (Google Apps Script)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  HOW TO SET UP (one-time, ~5 minutes):
 *
 *  1. Create a new Google Spreadsheet (or open an existing one).
 *
 *  2. Add these column headers in Row 1 (A1 → O1):
 *     Ticket ID | Name | Batch | Section | Phone | Email | City | Profession |
 *     Package | Seats | Amount (৳) | bKash TxID | bKash Phone | Status | Submitted At
 *
 *  3. Open Extensions → Apps Script.
 *
 *  4. Delete everything in Code.gs and paste THIS ENTIRE FILE.
 *
 *  5. Click Deploy → New deployment:
 *       • Type   → Web app
 *       • Execute as → Me
 *       • Who has access → Anyone
 *     Click "Deploy" and copy the Web app URL.
 *
 *  6. Paste that URL into your project's .env.local:
 *       VITE_GOOGLE_SHEETS_WEBAPP_URL="https://script.google.com/macros/s/XXXXXXX/exec"
 *
 *  7. Done! Every new registration will now auto-append a row to this sheet.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    sheet.appendRow([
      data.ticketId        || '',
      data.fullName        || '',
      data.batchYear       || '',
      data.section         || '',
      data.phone           || '',
      data.email           || '',
      data.currentCity     || '',
      data.profession      || '',
      data.packageName     || '',
      data.seats           || 0,
      data.totalAmount     || 0,
      data.bkashTxId       || '',
      data.bkashPhone      || '',
      data.status          || 'pending_verification',
      data.submittedAt     || new Date().toISOString(),
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Allow GET requests for testing — visit the URL in browser to verify deployment
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'DMHS Reunion Sheets integration is live!'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
