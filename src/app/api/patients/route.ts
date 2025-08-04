// src/app/api/patients/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // This is the corrected authentication method.
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!credentials.client_email || !credentials.private_key) {
        throw new Error("Server configuration error: Missing Google Service Account credentials.");
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ auth, version: 'v4' });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A2:O', // Read all potential columns for patient data
    });

    const rows = response.data.values || [];

    const uniquePatients: { [key: string]: any } = {};
    rows.forEach(row => {
      // Ensure the row is not empty and has a name (column B, index 1)
      if (row && row[1]) {
        // THIS IS THE FIX: Create a more robust unique key.
        // It will use the email if present, otherwise it combines name and phone.
        const email = row[3]?.trim();
        const name = row[1]?.trim();
        const phone = row[2]?.trim();
        const uniqueKey = email || `${name}-${phone}`;

        // This will always store the latest information found for that patient
        uniquePatients[uniqueKey] = {
          name: name || 'N/A', 
          phone: phone || 'N/A', 
          email: email || 'N/A', 
          address: row[4] || 'N/A',
          dateOfBirth: row[11] || 'N/A', 
          nationalInsurance: row[12] || 'N/A',
          maritalStatus: row[13] || 'N/A', 
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
