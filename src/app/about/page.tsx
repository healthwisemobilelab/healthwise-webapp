// src/app/about/page.tsx
import React from 'react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-teal-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-teal-700">
            Our Mission: Healthcare That Comes to You
          </h1>
          {/* --- FIX: Updated mission statement text --- */}
          <p className="mt-4 text-lg text-gray-600 font-sans max-w-2xl mx-auto">
            Health Wise was founded on a simple belief: accessing essential healthcare services should be <span className="font-bold">CONVENIENT</span>, <span className="font-bold">CONFIDENTIAL</span>, <span className="font-bold">COMFORTABLE</span> and <span className="font-bold">COMPASSIONATE</span>.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose prose-lg text-gray-600 font-sans">
          <p>
            Founded in Nassau with a mission to revolutionize healthcare accessibility, Health Wise Mobile Phlebotomy & Lab Services was born from a simple idea: healthcare should come to you. We understand that life is busy, clinical environments can be stressful, and mobility can be a challenge for many. Our goal is to eliminate these barriers by providing professional, certified, and gentle phlebotomy services in the comfort of your home, office, or preferred location.
          </p>
          <p>
            Our team is composed of highly skilled and experienced phlebotomists who are not only experts in their field but are also dedicated to providing a reassuring and positive experience. We adhere to the strictest standards of safety, sanitation, and privacy, ensuring that your health information is handled with the utmost care and confidentiality in compliance with HIPAA regulations.
          </p>
          <h2 className="text-teal-600 font-serif">Our Core Values</h2>
          <ul>
            <li><strong>Convenience:</strong> We work around your schedule, saving you the time and stress of travel and waiting rooms.</li>
            <li><strong>Comfort:</strong> A familiar environment reduces the anxiety often associated with medical procedures, leading to a better experience.</li>
            <li><strong>Compassion:</strong> Our friendly professionals prioritize your well-being, treating every patient with dignity and respect.</li>
            <li><strong>Confidentiality:</strong> We are fully compliant with health privacy standards to protect your sensitive information at every step.</li>
          </ul>
          <p>
            From routine blood draws to specialized kit collections, we are committed to providing the highest standard of mobile healthcare to the communities of Nassau and the Family Islands. Thank you for trusting Health Wise.
          </p>
        </div>
      </div>
    </div>
  );
}
