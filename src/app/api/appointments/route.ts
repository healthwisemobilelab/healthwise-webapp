import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@/lib/google-auth';

export async function GET() {
  try {
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
    const range = 'Sheet1!A2:R'; // Make sure the sheet name matches your Google Sheet tab exactly

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    return NextResponse.json({ appointments: rows });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
