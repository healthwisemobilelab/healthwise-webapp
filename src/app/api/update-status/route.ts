// src/app/api/update-status/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { rowIndex, newStatus } = await request.json();

    // Basic validation
    if (!rowIndex || !newStatus) {
      return NextResponse.json({ message: 'Missing rowIndex or newStatus' }, { status: 400 });
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

    // Update the specific cell in the "Status" column (column H)
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `H${rowIndex}`, // e.g., H2, H3, etc.
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newStatus]], // e.g., [["Confirmed"]] or [["Declined"]]
      },
    });

    return NextResponse.json({ message: `Status updated to ${newStatus}` }, { status: 200 });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error updating sheet', error: errorMessage }, { status: 500 });
  }
}