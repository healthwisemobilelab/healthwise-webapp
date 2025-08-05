// src/app/api/audit-log/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // --- MODIFICATION START ---
    // 1. Check for your intended environment variables.
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!serviceAccountEmail || !privateKey) {
        throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in environment variables.");
    }

    // 2. Use JWT authentication with the service account email and private key.
    // The private key needs its newline characters correctly formatted.
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey.replace(/\\n/g, '\n'), // This formatting is crucial
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    // --- MODIFICATION END ---

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
