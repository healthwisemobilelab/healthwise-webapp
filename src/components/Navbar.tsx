// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-teal-600 shadow-md sticky top-0 z-40">
      {/* The navbar container has a fixed height of 20 units (5rem or 80px) */}
      <div className="container mx-auto px-6 h-20 flex justify-between items-center">
        <Link href="/" className="h-full flex items-center">
          <Image 
            src="/logo-secondary.png" 
            alt="Health Wise Logo" 
            width={100} // Made the logo smaller
            height={25}  // Adjusted height to match
            priority
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/100/25/0d9488/ffffff?text=Health+Wise'; e.currentTarget.onerror = null; }}
            className="relative top-1" // Nudge the logo down slightly
          />
        </Link>
        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="text-white hover:text-yellow-300">Home</Link>
          <Link href="/about" className="text-white hover:text-yellow-300">About Us</Link>
          <Link href="/services" className="text-white hover:text-yellow-300">Services</Link>
          <Link href="/contact" className="text-white hover:text-yellow-300">Contact</Link>
          <Link
            href="/book"
            className="px-4 py-2 bg-yellow-400 text-teal-800 font-bold rounded-lg shadow-md hover:bg-yellow-300"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </nav>
  );
}
