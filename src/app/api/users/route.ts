// src/app/api/users/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Users root endpoint placeholder.' });
}
