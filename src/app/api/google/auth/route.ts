// src/app/api/google/auth/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Define the permissions our app needs
  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets',
  ];

  // Generate the URL for the consent screen
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // This is crucial to get a refresh token
    scope: scopes,
    include_granted_scopes: true,
  });

  // Redirect the user to the Google consent screen
  return NextResponse.redirect(authorizationUrl);
}
