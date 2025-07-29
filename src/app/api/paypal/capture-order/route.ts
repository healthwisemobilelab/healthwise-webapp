// src/app/api/paypal/capture-order/route.ts
import { NextRequest, NextResponse } from 'next/server';

const base = "https://api-m.sandbox.paypal.com";

async function generateAccessToken() {
  try {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
      process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET,
    ).toString("base64");
    
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
    throw error;
  }
}

async function captureOrder(orderID: string) {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderID}/capture`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const { orderID } = await request.json();
    if (!orderID) {
        return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
    }

    const captureData = await captureOrder(orderID);
    
    // Here you can add logic to save the successful transaction to your database
    // For now, we just return the capture data
    
    return NextResponse.json(captureData);
  } catch (error) {
    console.error("Failed to capture order:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
