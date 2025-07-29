// src/app/api/oauth2callback/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the path to our secure token storage file
const TOKEN_PATH = path.join(process.cwd(), 'google-auth-token.json');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange the code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save the refresh token securely to a file
    if (tokens.refresh_token) {
      const tokenData = {
        refresh_token: tokens.refresh_token,
      };
      await fs.writeFile(TOKEN_PATH, JSON.stringify(tokenData));
      console.log('Token stored to', TOKEN_PATH);
    }

    // Redirect the user back to the admin dashboard with a success message
    return NextResponse.redirect(new URL('/admin?auth=success', request.url));

  } catch (err) {
    console.error('Error retrieving access token', err);
    return NextResponse.json({ error: 'Failed to retrieve access token' }, { status: 500 });
  }
}
