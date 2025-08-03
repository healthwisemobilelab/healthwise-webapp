// src/app/api/submit/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // THIS IS THE FIX: Use the separate keys and correctly format the private key.
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!credentials.client_email || !credentials.private_key) {
        throw new Error("Missing Google Service Account credentials in .env.local file.");
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ auth, version: 'v4' });

    // Get the current data to find the last row
    const currentData = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'A:A',
    });
    const lastRow = currentData.data.values ? currentData.data.values.length : 0;
    const newRowIndex = lastRow + 1;

    // Prepare the new row with all the latest fields
    const newRow = [
      new Date().toLocaleString('en-US', { timeZone: 'America/Nassau' }),
      body.name, body.phone, body.email, body.address,
      body.service, body.requestedDate, 'Pending',
      body.specialInstructions || '', 
      '', '', // PhysicianInfo, VisitNotes
      body.dateOfBirth || '', 
      body.nationalInsurance || '',
      body.maritalStatus || '', 
      body.occupation || '',
      '', // RequisitionFileLink
      body.paymentStatus || 'N/A',
      '', // DepositStatus
    ];

    // Append the new row to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newRow],
      },
    });

    // Return a success response WITH the new row index
    return NextResponse.json({ 
        message: 'Success! Appointment requested.',
        rowIndex: newRowIndex 
    }, { status: 200 });

  } catch (error: any) {
    console.error("--- SUBMIT API ERROR ---", error);
    const errorMessage = error.message || 'Unknown error';
    return NextResponse.json({ message: 'Error submitting to sheet', error: errorMessage }, { status: 500 });
  }
}
