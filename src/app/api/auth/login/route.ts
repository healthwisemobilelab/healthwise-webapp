// src/app/api/auth/login/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
    }

    // This is the corrected authentication method.
    // It uses the two separate keys you have set up in Vercel.
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    // This check ensures the server is reading your Vercel variables correctly.
    if (!credentials.client_email || !credentials.private_key) {
        throw new Error("Server configuration error: Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in environment variables.");
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ auth, version: 'v4' });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Users!A2:C',
    });

    const users = response.data.values || [];

    const user = users.find(row => 
        row[0] && row[1] &&
        row[0].trim().toLowerCase() === email.trim().toLowerCase() && 
        row[1].trim() === password.trim()
    );

    if (user) {
      const userRole = user[2];
      return NextResponse.json({ success: true, user: { email: user[0], role: userRole } });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

  } catch (error) {
    console.error("Login API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Authentication error', error: errorMessage }, { status: 500 });
  }
}
