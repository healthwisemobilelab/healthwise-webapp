// src/app/booking-success/page.tsx
import Link from 'next/link';
import React from 'react';

export default function BookingSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <h1 className="text-4xl font-bold text-teal-700 font-serif">Thank You!</h1>
      <p className="mt-4 text-lg text-gray-600 font-sans">
        Your payment has been processed successfully and your appointment request has been submitted.
      </p>
      <p className="mt-2 text-gray-600 font-sans">
        We will review your request and send a confirmation email shortly.
      </p>
      <Link href="/" className="mt-8 px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700">
        Return to Homepage
      </Link>
    </div>
  );
}
