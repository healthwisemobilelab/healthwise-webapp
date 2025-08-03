// src/app/api/audit-log/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    if (!credentialsJson) {
        throw new Error("Missing GOOGLE_CREDENTIALS_JSON in environment variables.");
    }
    const credentials = JSON.parse(credentialsJson);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ auth, version: 'v4' });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Audit Log!A2:D',
    });

    const rows = response.data.values || [];

    const auditLog = rows.map(row => ({
      timestamp: row[0] || '',
      userEmail: row[1] || '',
      action: row[2] || '',
      details: row[3] || '',
    })).reverse(); // Reverse to show the most recent actions first

    return NextResponse.json(auditLog);

  } catch (error) {
    console.error("Audit Log API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error fetching audit log', error: errorMessage }, { status: 500 });
  }
}
