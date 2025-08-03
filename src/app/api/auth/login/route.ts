// src/app/api/auth/login/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
    }

    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    if (!credentialsJson) {
        console.error("Login API Error: Missing GOOGLE_CREDENTIALS_JSON in environment variables.");
        throw new Error("Server configuration error: Missing credentials.");
    }
    const credentials = JSON.parse(credentialsJson);

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
