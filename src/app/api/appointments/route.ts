// src/app/api/appointments/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ... (auth code is the same) ...
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ auth, version: 'v4' });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A2:I',
    });

    const rows = response.data.values || [];

    const appointments = rows.map((row, index) => ({
      rowIndex: index + 2, // Add this line. +2 because sheets are 1-indexed and we skip the header.
      timestamp: row[0],
      name: row[1],
      phone: row[2],
      email: row[3],
      address: row[4],
      service: row[5],
      requestedDate: row[6],
      status: row[7],
    }));

    return NextResponse.json(appointments);

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error fetching from sheet', error: errorMessage }, { status: 500 });
  }
}