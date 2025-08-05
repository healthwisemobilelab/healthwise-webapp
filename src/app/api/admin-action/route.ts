// src/app/api/admin-action/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

async function getAuthenticatedSheetsClient() {
    // This is the corrected authentication method for your localhost.
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!credentials.client_email || !credentials.private_key) {
        throw new Error("Server configuration error: Missing Google Service Account credentials.");
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
}

async function logAction(sheets: any, userEmail: string, action: string, details: string) {
    const newRow = [
      new Date().toLocaleString('en-US', { timeZone: 'America/Nassau' }),
      userEmail,
      action,
      details || '',
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Audit Log!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [newRow] },
    });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actionType, payload, user } = body;

    if (!actionType || !payload || !user) {
      return NextResponse.json({ message: 'Missing actionType, payload, or user' }, { status: 400 });
    }

    const sheets = await getAuthenticatedSheetsClient();

    switch (actionType) {
      case 'UPDATE_STATUS':
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: `H${payload.rowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[payload.newStatus]] },
        });
        await logAction(sheets, user.email, 'Updated Appointment Status', `Set status to ${payload.newStatus} for appointment row ${payload.rowIndex}`);
        break;

      case 'UPDATE_DEPOSIT_STATUS':
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: `R${payload.rowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[payload.newStatus]] },
        });
        await logAction(sheets, user.email, 'Updated Deposit Status', `Set deposit status to ${payload.newStatus} for appointment row ${payload.rowIndex}`);
        break;
        
      // We will add other actions here in the future
      default:
        return NextResponse.json({ message: 'Invalid action type' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Action completed successfully' });

  } catch (error) {
    console.error("Admin Action API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error processing action', error: errorMessage }, { status: 500 });
  }
}
