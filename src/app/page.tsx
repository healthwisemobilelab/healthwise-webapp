// src/app/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Fade } from 'react-slideshow-image'; // Changed from Slide to Fade
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

const FaqItem = ({ question, answer, answer2 }: { question: string, answer: string, answer2?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left py-4 flex justify-between items-center font-sans"
      >
        <span className="font-semibold text-gray-800">{question}</span>
        <span className="text-teal-700">{isOpen ? '-' : '+'}</span>
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600 font-sans">
          <p>{answer}</p>
          {answer2 && <p className="mt-2">{answer2}</p>}
        </div>
      )}
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
      <div className="relative overflow-hidden bg-gradient-to-b from-teal-600 via-teal-100 to-gray-50">
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <Image
            src="/favicon.png"
            alt="Health Wise Logo Backdrop"
            width={1000}
            height={1000}
            className="opacity-10"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        <section className="relative h-80 md:h-[500px] w-full z-10">
          {shuffledSlides.length > 0 && (
            <Fade duration={3000} indicators={true} arrows={false}>
              {shuffledSlides.map((slideImage, index) => (
                <div key={index} className="relative h-80 md:h-[500px] w-full">
                  <Image
                    src={slideImage.url}
                    alt={`Promotional image ${index + 1}`}
                    layout="fill"
                    objectFit="contain"
                    quality={90}
                    priority={index < 2}
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/1920x500/0f766e/ffffff?text=Image+Not+Found'; e.currentTarget.onerror = null; }}
                  />
                  {/* --- FIX: Added an overlay to soften the image edges --- */}
                  <div 
                    className="absolute inset-0" 
                    style={{ boxShadow: 'inset 0 0 50px 40px #0d9488' }}
                  ></div>
                </div>
              ))}
            </Fade>
          )}
        </section>

        {/* --- Combined and redesigned section --- */}
        <section className="text-teal-900 py-24 px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
              <span className="whitespace-nowrap font-bold">Compassionate Phlebotomy Services</span>
              <span className="block font-bold">At Your Convenience</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-teal-800 font-sans max-w-2xl mx-auto">
              Health Wise offers professional, private, and comfortable lab sample collection services brought directly to your doorstep in Nassau. Here’s why you should choose us:
            </p>
            
            <div className="mt-16 grid md:grid-cols-3 gap-10 text-left font-sans border-t border-teal-200 pt-12">
              <div className="p-6 bg-white/50 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-teal-800 font-serif">Ultimate Convenience</h3>
                <p className="mt-2 text-gray-700">No traffic, no waiting rooms. We come to you at your scheduled time, saving you hours in your day.</p>
              </div>
              <div className="p-6 bg-white/50 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-teal-800 font-serif">Professional & Safe</h3>
                <p className="mt-2 text-gray-700">Our certified phlebotomists follow strict safety protocols to ensure a secure and professional experience.</p>
              </div>
              <div className="p-6 bg-white/50 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-teal-800 font-serif">Comfort & Privacy</h3>
                <p className="mt-2 text-gray-700">Experience healthcare in a familiar, stress-free environment, like your home, office, boat/yacht. Your comfort and privacy are our top priorities.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-teal-700 mb-10 font-serif">Frequently Asked Questions</h2>
            <div className="space-y-2">
              <FaqItem 
                question="How do I prepare for my appointment?" 
                answer="Hydrate - Drinking 24oz of room temperature water before your appointment helps to hydrate your veins which makes them easier to locate and access. This leads to a less painful, smoother blood draw experience."
                answer2="Clothing - Wear loose, unrestricted, comfortable clothing that allows easy access to your arms, preferably with sleeves that are easily rolled up."
              />
              <FaqItem 
                question="Are your Phlebotomists/PCT’s certified?" 
                answer="Yes, all of our medical staff are certified and boast of having over 20 years of experience." 
              />
              <FaqItem question="What areas do you service?" answer="We proudly serve all of Nassau and the Family islands. Please contact us if you are in a surrounding area to confirm availability." />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
