// src/app/api/generate-report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Readable } from 'stream';
import fs from 'fs/promises';
import path from 'path';

const TOKEN_PATH = path.join(process.cwd(), 'google-auth-token.json');

async function getAuthenticatedClient() {
    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    if (credentialsJson) {
        const credentials = JSON.parse(credentialsJson);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file'],
        });
        return auth;
    }
    
    // Fallback for OAuth (needed for Drive uploads)
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
        throw new Error("Authorization token not found.");
      }
    }
    oauth2Client.setCredentials({ refresh_token: tokens.refresh_token });
    return oauth2Client;
}


async function createPdf(patient: any, reportData: any) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;

    const drawText = (text: string, x: number, yPos: number, isBold = false, size = 12) => {
        page.drawText(text, {
            x,
            y: yPos,
            font: isBold ? boldFont : font,
            size,
            color: rgb(0, 0, 0),
        });
        return yPos - (size + 5); // Return new y position
    };

    y = drawText('Health Wise Mobile Phlebotomy - Phlebotomist Report', 50, y, true, 18);
    y -= 20;

    y = drawText('Patient Information', 50, y, true, 14);
    y = drawText(`Name: ${patient.name}`, 50, y);
    y = drawText(`Date of Birth: ${patient.dateOfBirth}`, 50, y);
    y = drawText(`Email: ${patient.email}`, 50, y);
    y = drawText(`Phone: ${patient.phone}`, 50, y);
    y -= 20;

    y = drawText('Visit & Specimen Details', 50, y, true, 14);
    y = drawText(`Ordering Physician: ${reportData.orderingPhysician}`, 50, y);
    const collectedSpecimens = Object.entries(reportData.specimenTypes || {}).filter(([, checked]) => checked).map(([type]) => type).join(', ');
    y = drawText(`Specimens Collected: ${collectedSpecimens || 'None'}`, 50, y);
    const transportedTo = Object.entries(reportData.transportedTo || {}).filter(([, checked]) => checked).map(([lab]) => lab).join(', ');
    y = drawText(`Transported To: ${transportedTo || 'None'}`, 50, y);
    y = drawText(`Date/Time Transported: ${reportData.dateTransported} at ${reportData.timeTransported}`, 50, y);
    y -= 10;
    y = drawText('Notes:', 50, y, true);
    y = drawText(reportData.notes || 'N/A', 50, y);
    y -= 20;

    y = drawText('Phlebotomist Signature', 50, y, true, 14);
    y = drawText(reportData.phlebotomistSignature, 50, y);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}


export async function POST(request: NextRequest) {
  try {
    const { patient, reportData, appointment } = await request.json();

    if (!patient || !reportData || !appointment) {
      return NextResponse.json({ message: 'Missing required data' }, { status: 400 });
    }

    const auth = await getAuthenticatedClient();
    const drive = google.drive({ version: 'v3', auth });
    const sheets = google.sheets({ version: 'v4', auth });

    const pdfBuffer = await createPdf(patient, reportData);

    const stream = Readable.from(pdfBuffer);
    const driveResponse = await drive.files.create({
      requestBody: {
        name: `Report-${patient.name.replace(/\s/g, '_')}-${appointment.rowIndex}.pdf`,
        parents: [process.env.GOOGLE_DRIVE_REPORTS_FOLDER_ID!],
        mimeType: 'application/pdf',
      },
      media: {
        mimeType: 'application/pdf',
        body: stream,
      },
      fields: 'id, webViewLink',
    });

    const fileLink = driveResponse.data.webViewLink;

    await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `Sheet1!S${appointment.rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[fileLink]],
        },
    });

    // THIS IS THE FIX: Return the new link in the response.
    return NextResponse.json({ message: 'Report generated and saved successfully', link: fileLink });

  } catch (error: any) {
    console.error("--- GENERATE REPORT API ERROR ---", error);
    const errorMessage = error.response?.data?.error?.message || (error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ message: 'Error generating report', error: errorMessage }, { status: 500 });
  }
}
