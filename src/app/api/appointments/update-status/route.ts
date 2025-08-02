// /app/api/appointments/update-status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
  console.log('[DEBUG] Received POST request to /api/appointments/update-status');

  try {
    const body = await req.json();
    console.log('[DEBUG] Parsed request body:', body);

    const { rowIndex, newStatus } = body;

    if (typeof rowIndex !== 'number' || typeof newStatus !== 'string') {
      console.error('[ERROR] Invalid input data:', { rowIndex, newStatus });
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Authenticate with Google Sheets
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    console.log('[DEBUG] Authenticating with Google Sheets...');
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
    const sheetName = 'FormResponses';

    const range = `${sheetName}!A${rowIndex + 1}:Z${rowIndex + 1}`;
    console.log(`[DEBUG] Fetching row at range: ${range}`);

    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const row = readResponse.data.values?.[0];
    console.log('[DEBUG] Fetched row:', row);

    if (!row || row.length === 0) {
      console.error('[ERROR] No data found for the specified row index.');
      return NextResponse.json({ error: 'Row not found' }, { status: 404 });
    }

    // Get the header row to find "Status" column
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
    });

    const headers = headerResponse.data.values?.[0];
    console.log('[DEBUG] Sheet headers:', headers);

    if (!headers || !headers.includes('Status')) {
      console.error('[ERROR] "Status" column not found in sheet.');
      return NextResponse.json({ error: 'Status column not found' }, { status: 500 });
    }

    const statusColIndex = headers.indexOf('Status');
    row[statusColIndex] = newStatus;

    const updatedValues = [row];
    console.log(`[DEBUG] Updating row ${rowIndex + 1} with new status: ${newStatus}`);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowIndex + 1}:Z${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: updatedValues },
    });

    console.log('[DEBUG] Status updated successfully.');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ERROR] Failed to update status:', error.message, error.stack);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
