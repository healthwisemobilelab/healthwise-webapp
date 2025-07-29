// src/app/api/update-patient-details/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { rowIndex, patientData } = await request.json();

    if (!rowIndex || !patientData) {
      return NextResponse.json({ message: 'Missing rowIndex or patientData' }, { status: 400 });
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

    // Prepare the row data in the correct order for the sheet
    const valuesToUpdate = [
      patientData.phone,
      patientData.address,
      null, // Placeholder for Service
      null, // Placeholder for RequestedDate
      null, // Placeholder for Status
      null, // Placeholder for SpecialInstructions
      null, // Placeholder for PhysicianInfo
      null, // Placeholder for VisitNotes
      patientData.dateOfBirth,
      patientData.nationalInsurance,
      patientData.maritalStatus,
      patientData.occupation,
    ];

    // This will update the range of cells containing patient-specific info
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `C${rowIndex}:P${rowIndex}`, // Update from Phone to Occupation
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [valuesToUpdate],
      },
    });

    return NextResponse.json({ message: 'Patient details updated successfully' }, { status: 200 });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error updating sheet', error: errorMessage }, { status: 500 });
  }
}
