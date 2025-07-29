// src/app/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import Image from 'next/image';

// --- Your Slideshow Images ---
const initialSlideImages = [
  { url: '/slide-1.jpg' },
  { url: '/slide-2.jpg' },
  { url: '/slide-3.jpg' },
  { url: '/slide-4.jpg' },
  { url: '/slide-5.jpg' },
  { url: '/slide-6.jpg' },
  { url: '/slide-7.jpg' },
  { url: '/slide-8.jpg' },
];

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left py-4 flex justify-between items-center font-sans"
      >
        <span className="font-semibold text-gray-800">{question}</span>
        <span>{isOpen ? '-' : '+'}</span>
      </button>
      {isOpen && <div className="pb-4 text-gray-600 font-sans">{answer}</div>}
    </div>
  );
};

export default function HomePage() {
  const [shuffledSlides, setShuffledSlides] = useState<typeof initialSlideImages>([]);

  // This effect runs once on the client to shuffle the images
  useEffect(() => {
    setShuffledSlides([...initialSlideImages].sort(() => Math.random() - 0.5));
  }, []);

  return (
    <>
      {/* Slideshow returned to original size, borders removed */}
      <section className="relative h-96 w-full">
        {shuffledSlides.length > 0 && (
          <Slide duration={4000} transitionDuration={1000} indicators={true} arrows={false}>
            {shuffledSlides.map((slideImage, index) => (
              <div key={index} className="relative h-96 w-full">
                <Image
                  src={slideImage.url}
                  alt={`Promotional image ${index + 1}`}
                  layout="fill"
                  objectFit="fill" // Stretches the image to fit the container
                  quality={90}
                  priority={index < 2}
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/1920x384/0f766e/ffffff?text=Image+Not+Found'; e.currentTarget.onerror = null; }}
                />
              </div>
            ))}
          </Slide>
        )}
      </section>

      {/* Relocated Hero Section with Watermark */}
      <section className="bg-teal-600 text-white py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <Image
            src="/logo-secondary.png"
            alt="Health Wise Logo Backdrop"
            width={500}
            height={500}
            className="opacity-10 relative top-12"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
            <span className="whitespace-nowrap">Compassionate Phlebotomy Services</span>
            <span className="block">At Your Convenience</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-teal-100 font-sans max-w-2xl mx-auto">
            Health Wise offers professional, private, and comfortable lab sample collection services brought directly to your doorstep in Nassau.
          </p>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-teal-700 mb-10 font-serif">Why Choose Health Wise?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center font-sans">
            <div><h3 className="text-xl font-semibold text-teal-600 font-serif">Ultimate Convenience</h3><p className="mt-2 text-gray-600">No traffic, no waiting rooms. We come to you at your scheduled time, saving you hours of your day.</p></div>
            <div><h3 className="text-xl font-semibold text-teal-600 font-serif">Professional & Safe</h3><p className="mt-2 text-gray-600">Our certified phlebotomists follow strict safety protocols to ensure a secure and professional experience.</p></div>
            <div><h3 className="text-xl font-semibold text-teal-600 font-serif">Comfort & Privacy</h3><p className="mt-2 text-gray-600">Experience healthcare in a familiar, stress-free environment, like your home or office. Your comfort and privacy are our top priorities.</p></div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-teal-700 mb-10 font-serif">Frequently Asked Questions</h2>
          <div className="space-y-2">
            <FaqItem question="How do I prepare for my appointment?" answer="Please drink plenty of water before your appointment to ensure you are well-hydrated, which makes the blood draw process easier. Follow any fasting instructions provided by your doctor." />
            <FaqItem question="Are your phlebotomists certified?" answer="Yes, all of our phlebotomists are nationally certified and have extensive experience in a variety of clinical settings." />
            <FaqItem question="What areas do you service?" answer="We proudly serve all of Nassau and the Family islands. Please contact us if you are in a surrounding area to confirm availability." />
          </div>
        </div>
      </section>
    </>
  );
}
