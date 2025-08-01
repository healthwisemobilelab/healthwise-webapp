// src/app/api/patients/route.ts
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
      range: 'A2:O',
    });

    const rows = response.data.values || [];

    const uniquePatients: { [key: string]: any } = {};
    rows.forEach(row => {
      if (row && row[1]) {
        const email = row[3] || `${row[1]}-no-email`;
        uniquePatients[email] = {
          name: row[1], phone: row[2] || 'N/A', email: row[3] || 'N/A', 
          address: row[4] || 'N/A', dateOfBirth: row[11] || 'N/A', 
          nationalInsurance: row[12] || 'N/A', maritalStatus: row[13] || 'N/A', 
          occupation: row[14] || 'N/A',
        };
      }
    });

    const patientList = Object.values(uniquePatients);
    return NextResponse.json(patientList);

  } catch (error) {
    console.error("Patients API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error fetching patients', error: errorMessage }, { status: 500 });
  }
}
