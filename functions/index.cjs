const functions = require('firebase-functions');
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: './service-account.json',
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ],
});

const sheets = google.sheets({ version: 'v4', auth });
const serviceAccount = require('./service-account.json');
const cors = require('cors');
const corsHandler = cors({ origin: true });
const nodemailer = require('nodemailer');


exports.getFuelData = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    console.log('⚡️ getFuelData triggered with body:', JSON.stringify(req.body));

    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST requests allowed' });
      }

 const { sheetId, sheetName } = req.body;
console.log('📥 Received sheetId:', sheetId, '| sheetName:', sheetName);

// Always access the 'Fuel Accounting by Invoice' worksheet
const tabName = 'Fuel Accounting by Invoice';
const range = `${tabName}!A1:ZZ500`;

const response = await sheets.spreadsheets.values.get({
  spreadsheetId: sheetId,
  range,
  majorDimension: 'ROWS',
});
      const rows = response.data.values;
      console.log(`📊 Fetching range ${range} from sheet ${sheetId}`);
      console.log(`✅ Retrieved ${rows.length} rows`);

      console.log('🪵 Logging first 30 rows of Column D:');
      for (let i = 0; i < Math.min(30, rows.length); i++) {
        console.log(`Row ${i + 1} | D: "${rows[i]?.[3]}"`);
      }

      const unitHeaderRowIndex = rows.findIndex((row, idx) =>
        idx >= 5 && idx <= 25 && row[3]?.trim().toLowerCase() === 'unit #'
      );

      if (unitHeaderRowIndex === -1) {
        console.warn('⚠️ Could not find "Unit #" header');
        return res.status(200).json({ fuelData: [], dateHeaders: [] });
      }

      const deliveryDateRowIndex = 6; // Row 7 = index 6
      const deliveryDateRow = rows[deliveryDateRowIndex] || [];

      const allValidDateHeaders = [];
      for (let col = 6; col < deliveryDateRow.length; col++) {
        const rawDate = deliveryDateRow[col];
        const parsed = parseDate(rawDate);
        if (parsed) {
          allValidDateHeaders[col] = rawDate;
        }
      }

      const units = [];

for (let i = unitHeaderRowIndex + 1; i < rows.length; i++) {
  const row = rows[i];
  const unitCell = row[3]?.trim();

  if (unitCell?.toLowerCase() === 'end') break;
  if (!unitCell) continue; // skip blank rows

  const unit = unitCell; // ✅ define unit here
  const plate = row[4] || '';
  const fuelType = row[5] || '';
  const deliveries = [];

  for (let col = 6; col < row.length; col++) {
    const rawDate = deliveryDateRow[col];
    const parsedDate = parseDate(rawDate);
    const value = row[col];
const numericValue = parseFloat(value);

if (parsedDate) {
  const cleanedValue =
    isNaN(numericValue) || numericValue === 0 ? '' : value.toString();

  deliveries.push({
    date: parsedDate,
    value: cleanedValue,
  });
}
  }

  units.push({ unit, plate, fuelType, deliveries });
}


      return res.status(200).json({
        fuelData: units,
        dateHeaders: deliveryDateRow.filter((d) => parseDate(d)),
      });

    } catch (err) {
      console.error('🔥 CRITICAL ERROR in getFuelData:', {
        message: err.message,
        stack: err.stack,
      });
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
});

exports.loginProxy = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { email, password } = req.body;
      console.log('📩 Login requested for email:', email);

      const MASTER_SHEET_ID = '1I8PqW_WTdhb2kt5mNvjh9TDMO_Cs0XnNE0R5gYnj7kg';
      const MASTER_RANGE = 'Master Credentials Log!A2:C';
      console.log('📄 Fetching credentials from:', MASTER_RANGE);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: MASTER_SHEET_ID,
        range: MASTER_RANGE,
      });

      console.log('✅ Fetched credential rows:', response.data.values?.length || 0);
      const rows = response.data.values || [];

      const match = rows.find(
        (row) => row[0]?.trim().toLowerCase() === email.trim().toLowerCase() && row[1] === password
      );

      if (!match) {
        console.warn('❌ No matching credentials found for:', email);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const sheetName = match[2];
      console.log('🔍 Matched customer sheet name:', sheetName);

      const drive = google.drive({ version: 'v3', auth });
      const driveRes = await drive.files.list({
        q: `name = '${sheetName}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
        fields: 'files(id, name)',
      });

      if (!driveRes.data.files || driveRes.data.files.length === 0) {
        console.error('❌ Sheet not found in Drive for name:', sheetName);
        return res.status(404).json({ success: false, message: 'Sheet not found in Drive' });
      }

      const customerSheetId = driveRes.data.files[0].id;
      console.log('✅ Found customer sheet ID:', customerSheetId);

      return res.status(200).json({
        success: true,
        sheetId: customerSheetId,
        sheetName: sheetName,
      });

    } catch (err) {
      console.error('🔥 loginProxy crash:', err.message);
      console.error(err.stack);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
});

exports.getInvoiceData = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {

    const { customerName, sheetId } = req.body;
    console.log('📥 Request received:', { customerName, sheetId });

    if (!customerName || !sheetId) {
      console.error('❌ Missing required fields:', { customerName, sheetId });
      return res.status(400).json({ error: 'Missing customerName or sheetId' });
    }

    try {
      const sheetMetadata = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
      const sheetNames = sheetMetadata.data.sheets.map(s => s.properties.title);

      const allInvoices = [];

      for (const sheetName of sheetNames) {
        const range = `'${sheetName}'!A1:AZ1000`;
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) continue;

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const nameInSheet = (row[2] || '').trim();

          if (nameInSheet.toLowerCase() === customerName.toLowerCase()) {
const invoice = {
  invoiceDate: row[1] || '',
  invoiceId: row[3] || '',
  clearGas: row[4] || '',
  dyedGas: row[5] || '',
  clearDiesel: row[7] || '',
  dyedDiesel: row[8] || '',
  defVolume: row[11] || '',
  gasCost: row[12] || '',
  gasDyedCost: row[13] || '',
  dieselCost: row[15] || '',
  dieselDyedCost: row[16] || '',
  defCost: row[35] || '',
  totalFuelCost: row[24] || '',
  deliveryFee: row[36] || '',
  otherCharges: row[37] || '',
  subtotal: row[38] || '',
  pst: row[40] || '',
  gst: row[41] || '',
  total: row[42] || '',
  unitsFilled: row[43] || '',
  sheet: sheetName
};
            allInvoices.push(invoice);
          }
        }
      }

      return res.status(200).json(allInvoices);
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      return res.status(500).json({ error: 'Unable to retrieve invoice data' });
    }
  }); // ✅ ← closing for corsHandler
});

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const EMAIL_USER = defineSecret("EMAIL_USER");
const EMAIL_PASS = defineSecret("EMAIL_PASS");

exports.sendDashboardEmail = onRequest(
  {
    secrets: [EMAIL_USER, EMAIL_PASS],
  },
  (req, res) => {
    corsHandler(req, res, async () => {
      const { type, customerName, messageBody, newUserName, newUserEmail } = req.body;

      const user = process.env.EMAIL_USER;
      const pass = process.env.EMAIL_PASS;

      if (!type || !customerName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user,
          pass,
        },
      });

      let subject = "";
      let text = "";

      if (type === "contact" && messageBody) {
        subject = `Dashboard Inquiry + ${customerName}`;
        text = `Message from ${customerName}:\n\n${messageBody}`;
      } else if (type === "newUser" && newUserName && newUserEmail) {
        subject = `New User Request + ${customerName}`;
        text = `Customer: ${customerName}\nNew User Name: ${newUserName}\nNew User Email: ${newUserEmail}`;
      } else {
        return res.status(400).json({ error: "Missing or invalid fields for request type" });
      }

      try {
        await transporter.sendMail({
          from: user,
          to: "contact@fuelsrv.com",
          subject,
          text,
        });

        return res.status(200).json({ success: true });
      } catch (error) {
        console.error("Email send error:", error);
        return res.status(500).json({ error: "Email send failed", details: error.message });
      }
    });
  }
);






function parseDate(input) {
  const date = new Date(input);
  if (isNaN(date)) return null;
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}


