// src/app/api/update-patient-notes/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { rowIndex, physicianInfo, visitNotes } = await request.json();

    if (!rowIndex) {
      return NextResponse.json({ message: 'Missing rowIndex' }, { status: 400 });
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

    // This API now updates only the specific row for the visit being edited.
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `J${rowIndex}:K${rowIndex}`, // Targets the PhysicianInfo and VisitNotes columns for the specific row
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[physicianInfo || '', visitNotes || '']],
      },
    });

    return NextResponse.json({ message: 'Patient notes updated successfully' }, { status: 200 });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error updating sheet', error: errorMessage }, { status: 500 });
  }
}
