// src/app/api/log-action/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, action, details } = await request.json();

    if (!userEmail || !action) {
      return NextResponse.json({ message: 'Missing userEmail or action' }, { status: 400 });
    }

    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ auth, version: 'v4' });

    const newRow = [
      new Date().toLocaleString('en-US', { timeZone: 'America/Nassau' }),
      userEmail,
      action,
      details || '', // Details are optional
    ];

    // Append the new log entry to the 'Audit Log' sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Audit Log!A1', // Specify the sheet name here
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newRow],
      },
    });

    return NextResponse.json({ message: 'Action logged successfully' });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error logging action', error: errorMessage }, { status: 500 });
  }
}
