// src/app/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left py-4 flex justify-between items-center"
      >
        <span className="font-semibold text-gray-800">{question}</span>
        <span>{isOpen ? '-' : '+'}</span>
      </button>
      {isOpen && <div className="pb-4 text-gray-600">{answer}</div>}
    </div>
  );
};

export default function HomePage() {
  return (
    <>
      <section className="bg-teal-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-extrabold">
              Compassionate Phlebotomy, At Your Convenience.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-teal-100">
              Health Wise offers professional, private, and comfortable lab sample collection services brought directly to your doorstep in Nassau.
            </p>
            <Link
              href="/book"
              className="mt-8 inline-block px-10 py-4 bg-yellow-400 text-teal-800 font-bold text-lg rounded-lg shadow-lg hover:bg-yellow-300 transition-transform transform hover:scale-105"
            >
              Book An Appointment
            </Link>
          </div>
          <div className="mt-10 md:mt-0 md:w-1/2 flex justify-center">
            <Image
              src="/logo.png"
              alt="Health Wise Mobile Phlebotomy Logo"
              width={300}
              height={300}
              priority
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/300x300/0d9488/ffffff?text=Health+Wise'; e.currentTarget.onerror = null; }}
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-white px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-teal-700 mb-10">Why Choose Health Wise?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div><h3 className="text-xl font-semibold text-teal-600">Ultimate Convenience</h3><p className="mt-2 text-gray-600">No traffic, no waiting rooms. We come to you at your scheduled time, saving you hours of your day.</p></div>
            <div><h3 className="text-xl font-semibold text-teal-600">Professional & Safe</h3><p className="mt-2 text-gray-600">Our certified phlebotomists follow strict safety protocols to ensure a secure and professional experience.</p></div>
            <div><h3 className="text-xl font-semibold text-teal-600">Comfort & Privacy</h3><p className="mt-2 text-gray-600">Experience healthcare in a familiar, stress-free environment. Your comfort and privacy are our top priorities.</p></div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-teal-700 mb-10">Frequently Asked Questions</h2>
          <div className="space-y-2">
            <FaqItem question="How do I prepare for my appointment?" answer="Please drink plenty of water before your appointment to ensure you are well-hydrated, which makes the blood draw process easier. Follow any fasting instructions provided by your doctor." />
            <FaqItem question="Are your phlebotomists certified?" answer="Yes, all of our phlebotomists are nationally certified and have extensive experience in a variety of clinical settings." />
            <FaqItem question="What areas do you service?" answer="We proudly serve all of Nassau and New Providence. Please contact us if you are in a surrounding area to confirm availability." />
          </div>
        </div>
      </section>
    </>
  );
}
