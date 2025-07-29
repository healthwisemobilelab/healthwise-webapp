// src/app/api/upload-requisition/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import fs from 'fs/promises';
import path from 'path';

// Define the path to our secure token storage file
const TOKEN_PATH = path.join(process.cwd(), 'google-auth-token.json');

export async function POST(request: NextRequest) {
  try {
    // --- Step 1: Create an authorized OAuth2 client ---
    const tokenFile = await fs.readFile(TOKEN_PATH, 'utf8');
    const tokens = JSON.parse(tokenFile);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({ refresh_token: tokens.refresh_token });

    // --- Step 2: Get the file and data from the request ---
    const formData = await request.formData();
    const file = formData.get('requisitionFile') as File | null;
    const rowIndex = formData.get('rowIndex') as string | null;

    if (!file || !rowIndex) {
      return NextResponse.json({ message: 'Missing file or rowIndex' }, { status: 400 });
    }

    // --- Step 3: Upload the file to Google Drive using the authorized client ---
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    const driveResponse = await drive.files.create({
      requestBody: {
        name: `${rowIndex}-${file.name}`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: 'id, webViewLink',
    });

    const fileLink = driveResponse.data.webViewLink;

    // --- Step 4: Update the Google Sheet with the file link ---
    // We must use the Service Account for Sheets as it's simpler for non-user-interactive tasks
     const serviceAccountAuth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth: serviceAccountAuth });
    await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `P${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[fileLink]],
        },
    });

    return NextResponse.json({ message: 'File uploaded successfully', link: fileLink });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error uploading file', error: errorMessage }, { status: 500 });
  }
}
