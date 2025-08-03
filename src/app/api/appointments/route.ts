// src/app/api/appointments/route.ts
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
      range: 'A2:R',
    });

    const rows = response.data.values || [];

    const appointments = rows.map((row, index) => ({
      rowIndex: index + 2,
      timestamp: row[0] || '', name: row[1] || '', phone: row[2] || '',
      email: row[3] || '', address: row[4] || '', service: row[5] || '',
      requestedDate: row[6] || '', status: row[7] || '', specialInstructions: row[8] || '',
      physicianInfo: row[9] || '', visitNotes: row[10] || '', dateOfBirth: row[11] || '',
      nationalInsurance: row[12] || '', maritalStatus: row[13] || '', occupation: row[14] || '',
      requisitionFileLink: row[15] || '', paymentStatus: row[16] || 'N/A', depositStatus: row[17] || '', 
    }));

    return NextResponse.json(appointments);

  } catch (error) {
    console.error("Appointments API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error fetching appointments', error: errorMessage }, { status: 500 });
  }
}
