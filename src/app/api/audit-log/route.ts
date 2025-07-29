// src/app/api/audit-log/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ auth, version: 'v4' });

    // Read the 'Audit Log' sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Audit Log!A2:D', // Read from the Audit Log sheet, skipping the header
    });

    const rows = response.data.values || [];

    // Map the rows to objects for easier use on the frontend
    const auditLog = rows.map(row => ({
      timestamp: row[0] || '',
      userEmail: row[1] || '',
      action: row[2] || '',
      details: row[3] || '',
    })).reverse(); // Reverse to show the most recent actions first

    return NextResponse.json(auditLog);

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error fetching audit log', error: errorMessage }, { status: 500 });
  }
}
