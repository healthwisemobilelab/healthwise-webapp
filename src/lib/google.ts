// src/lib/google.ts
import { google } from 'googleapis';

export async function getGoogleAuth() {
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
  if (!credentialsJson) throw new Error("Missing GOOGLE_CREDENTIALS_JSON");

  const credentials = JSON.parse(credentialsJson);

  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ]
  });
}

export async function getSheetsClient() {
  const auth = await getGoogleAuth();
  return google.sheets({ version: 'v4', auth });
}

export async function getDriveClient() {
  const auth = await getGoogleAuth();
  return google.drive({ version: 'v3', auth });
}
