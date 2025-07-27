// src/app/layout.tsx
import './globals.css';
import type { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
// Import the font loaders from Next.js
import { Playfair_Display, Cormorant_Garamond } from 'next/font/google';

// Configure the fonts
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display', // Create a CSS variable
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '700'], // Load regular and bold weights
  variable: '--font-cormorant-garamond', // Create a CSS variable
  display: 'swap',
});

export const metadata = {
  title: 'Health Wise Mobile Phlebotomy',
  description: 'We bring the lab to you — Mobile Phlebotomy & Lab Services in Nassau, Bahamas',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Apply the font variables to the entire site
    <html lang="en" className={`${playfairDisplay.variable} ${cormorantGaramond.variable}`}>
      <body className="bg-gray-100 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
