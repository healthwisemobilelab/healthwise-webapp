// src/app/api/upload-requisition/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

export async function POST(request: NextRequest) {
  try {
    // --- FIX: Use OAuth2 with the new refresh token ---
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
    // --- END FIX ---

    const formData = await request.formData();
    const file = formData.get('requisitionFile') as File | null;
    const rowIndex = formData.get('rowIndex') as string | null;

    if (!file || !rowIndex) {
      return NextResponse.json({ message: 'Missing file or rowIndex' }, { status: 400 });
    }

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
    const errorMessage = error.response?.data?.error?.message || (error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ message: 'Error uploading file', error: errorMessage }, { status: 500 });
  }
}
