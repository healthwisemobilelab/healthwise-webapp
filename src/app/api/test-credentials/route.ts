// src/app/api/test-credentials/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Test if the variable exists
    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    if (!credentialsJson) {
      throw new Error("Test Failed: The GOOGLE_CREDENTIALS_JSON environment variable was not found on the server.");
    }

    // 2. Test if the variable is valid JSON
    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch (e) {
      throw new Error("Test Failed: The GOOGLE_CREDENTIALS_JSON value is not valid JSON. Please check for copy-paste errors.");
    }

    // 3. Test if the JSON contains the required field
    if (!credentials.client_email) {
        throw new Error("Test Failed: The parsed JSON does not contain a 'client_email' field. The key is likely corrupted.");
    }

    // 4. Test if we can authenticate with Google
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ auth, version: 'v4' });

    // 5. Test if we can perform a simple, read-only action
    await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });

    // If all tests pass, return a success message
    return NextResponse.json({ 
        status: 'Success', 
        message: 'All tests passed! The GOOGLE_CREDENTIALS_JSON is configured correctly and authentication with Google is working.' 
    });

  } catch (error) {
    console.error("--- CREDENTIALS TEST FAILED ---", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ 
        status: 'Error', 
        message: errorMessage 
    }, { status: 500 });
  }
}
