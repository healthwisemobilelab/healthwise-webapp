// src/app/api/update-deposit-status/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { rowIndex, newStatus } = await request.json();

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

    // This will update the specific cell in the "DepositStatus" column (column R)
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `R${rowIndex}`, // e.g., R2, R3, etc.
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newStatus]], // e.g., [["Paid"]]
      },
    });

    return NextResponse.json({ message: `Deposit status updated to ${newStatus}` }, { status: 200 });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error updating sheet', error: errorMessage }, { status: 500 });
  }
}
