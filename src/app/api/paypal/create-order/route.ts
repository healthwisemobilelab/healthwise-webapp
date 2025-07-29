// src/app/api/paypal/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Base URL for the PayPal API
const base = "https://api-m.sandbox.paypal.com";

// Function to generate a PayPal access token
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

// Function to create a new order
async function createOrder(amount: string, serviceName: string) {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders`;
  
  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD", // Or BSD if supported and preferred
          value: amount,
        },
        description: `Payment for: ${serviceName}`,
      },
    ],
    // Define where to redirect the user after payment
    application_context: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking-success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking-cancelled`,
    }
  };
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });
  
  const data = await response.json();
  return data;
}

// The main API route handler
export async function POST(request: NextRequest) {
  try {
    const { amount, serviceName } = await request.json();
    if (!amount || !serviceName) {
        return NextResponse.json({ error: "Missing amount or service name" }, { status: 400 });
    }

    const order = await createOrder(amount, serviceName);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to create order:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
