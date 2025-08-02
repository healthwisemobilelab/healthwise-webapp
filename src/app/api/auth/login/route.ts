import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get email and password from request body
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
    }

    // Parse Google credentials from environment variable
    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    if (!credentialsJson) {
      throw new Error("Missing GOOGLE_CREDENTIALS_JSON in environment variables.");
    }
    const credentials = JSON.parse(credentialsJson);

    // Authenticate with Google Sheets API (readonly access)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ auth, version: 'v4' });

    // Read users from 'Users' sheet, skipping header row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Users!A2:C',
    });

    const users = response.data.values || [];

    // Find user matching email and password
    const user = users.find(row => 
      row[0] && row[1] &&
      row[0].trim().toLowerCase() === email.trim().toLowerCase() &&
      row[1].trim() === password.trim()
    );

    if (user) {
      // Return user email and role if found
      return NextResponse.json({
        success: true,
        user: { email: user[0], role: user[2] || 'Staff' }
      });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

  } catch (error) {
    console.error("Login API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Authentication error', error: errorMessage }, { status: 500 });
  }
}
