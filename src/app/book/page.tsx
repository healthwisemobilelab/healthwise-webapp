// src/app/book/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import BookingForm from '@/components/BookingForm';

export default function BookAppointmentPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  return (
    <>
      {isFormOpen && <BookingForm onClose={() => setIsFormOpen(false)} setBookingMessage={setBookingMessage} />}
      
      <section className="bg-white py-12 px-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="Health Wise Mobile Phlebotomy Logo"
            width={120}
            height={120}
            priority
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/120x120/0d9488/ffffff?text=HW'; e.currentTarget.onerror = null; }}
          />
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-teal-700">
            Schedule Your Appointment
          </h1>
          <p className="mt-4 text-xl md:text-2xl font-light text-gray-600">
            "We bring the lab to you."
          </p>
          <p className="mt-8 text-lg text-gray-700">
            Select a convenient time and our certified phlebotomists will come to your home or office.
          </p>
          <button
            onClick={() => { setIsFormOpen(true); setBookingMessage(''); }}
            className="mt-10 px-8 py-4 bg-yellow-400 text-teal-800 font-bold text-lg rounded-lg shadow-lg hover:bg-yellow-300 transition-transform transform hover:scale-105"
          >
            Book Now
          </button>
          {bookingMessage && <p className="mt-4 text-lg font-semibold text-green-600">{bookingMessage}</p>}
        </div>
      </section>
    </>
  );
}
