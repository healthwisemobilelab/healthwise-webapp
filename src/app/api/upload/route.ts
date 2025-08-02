// src/app/api/upload/route.ts

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'Upload endpoint placeholder.' });
}
