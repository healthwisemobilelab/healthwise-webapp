// src/app/api/patients/route.ts
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

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A2:O', // Read all data
    });

    const rows = response.data.values || [];

    const uniquePatients: { [key: string]: any } = {};
    rows.forEach(row => {
      const email = row[3];
      if (email) {
        // Always update with the latest info for that patient
        uniquePatients[email] = {
          name: row[1], phone: row[2], email: row[3], address: row[4],
          dateOfBirth: row[11] || 'N/A', nationalInsurance: row[12] || 'N/A',
          maritalStatus: row[13] || 'N/A', occupation: row[14] || 'N/A',
        };
      }
    });

    const patientList = Object.values(uniquePatients);
    return NextResponse.json(patientList);

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error fetching from sheet', error: errorMessage }, { status: 500 });
  }
}
