// src/app/api/upload-requisition/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import fs from 'fs/promises';
import path from 'path';

const TOKEN_PATH = path.join(process.cwd(), 'google-auth-token.json');

export async function POST(request: NextRequest) {
  try {
    // --- Step 1: Create an authorized OAuth2 client ---
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Missing Google OAuth credentials in environment variables.");
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    let tokens;
    if (process.env.GOOGLE_AUTH_TOKEN_JSON) {
      tokens = JSON.parse(process.env.GOOGLE_AUTH_TOKEN_JSON);
    } else {
      try {
        const tokenFile = await fs.readFile(TOKEN_PATH, 'utf8');
        tokens = JSON.parse(tokenFile);
      } catch (err) {
        throw new Error("Authorization token not found. Please re-connect to Google Drive from the admin dashboard.");
      }
    }
    oauth2Client.setCredentials({ refresh_token: tokens.refresh_token });

    // --- Step 2: Get the file and data from the request ---
    const formData = await request.formData();
    const file = formData.get('requisitionFile') as File | null;
    const rowIndex = formData.get('rowIndex') as string | null;

    if (!file || !rowIndex) {
      return NextResponse.json({ message: 'Missing file or rowIndex' }, { status: 400 });
    }

    // --- Step 3: Upload the file to Google Drive ---
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
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `P${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[fileLink]],
        },
    });

    return NextResponse.json({ message: 'File uploaded successfully', link: fileLink });

  } catch (error: any) {
    console.error("--- UPLOAD API ERROR ---", error);
    const errorMessage = error.message || 'Unknown error';
    return NextResponse.json({ message: 'Error uploading file', error: errorMessage }, { status: 500 });
  }
}
