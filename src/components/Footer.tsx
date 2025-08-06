// src/components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-teal-700 text-white">
      <div className="container mx-auto py-8 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            {/* --- FIX: Reverted to two lines, both bold and uppercase --- */}
            <p className="font-bold text-lg uppercase">Health Wise Mobile Phlebotomy Lab</p>
            <p className="text-sm text-teal-100 uppercase font-bold">"We bring the lab to you."</p>
          </div>
          <div className="flex space-x-6">
            <Link href="/about" className="hover:text-yellow-300">About</Link>
            <Link href="/services" className="hover:text-yellow-300">Services</Link>
            <Link href="/contact" className="hover:text-yellow-300">Contact</Link>
          </div>
        </div>
        <div className="text-center text-teal-200 text-sm mt-6 border-t border-teal-600 pt-4">
          &copy; {new Date().getFullYear()} Health Wise. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
