// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-teal-600 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-6 h-20 flex justify-between items-center">
        <Link href="/" className="h-full flex items-center">
          <Image 
            src="/logo.png" 
            alt="Health Wise Logo" 
            width={64}
            height={64}
            priority
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/64x64/0d9488/ffffff?text=HW'; e.currentTarget.onerror = null; }}
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
