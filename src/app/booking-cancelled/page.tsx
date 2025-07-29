// src/app/booking-cancelled/page.tsx
import Link from 'next/link';
import React from 'react';

export default function BookingCancelledPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <h1 className="text-4xl font-bold text-yellow-600 font-serif">Payment Cancelled</h1>
      <p className="mt-4 text-lg text-gray-600 font-sans">
        Your payment process was cancelled. Your appointment has not been booked yet.
      </p>
      <p className="mt-2 text-gray-600 font-sans">
        Please complete the payment to secure your appointment.
      </p>
      <Link href="/book" className="mt-8 px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700">
        Return to Booking Page
      </Link>
    </div>
  );
}
