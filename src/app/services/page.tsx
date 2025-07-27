// src/app/services/page.tsx
'use client';

import Link from 'next/link';
import { FaTint, FaMicroscope, FaStethoscope, FaSyringe, FaPills, FaHeartbeat, FaSearch, FaFlask } from 'react-icons/fa';

export default function ServicesPage() {
  const services = [
    {
      name: 'Routine Annual Blood Draws',
      description: 'Convenient collection for your yearly check-ups, directly at your home or office.',
      icon: FaTint,
    },
    {
      name: 'Vital Signs & Basic Lab Testing',
      description: 'Includes blood pressure, blood glucose, and blood typing, ensuring essential health indicators are monitored.',
      icon: FaStethoscope,
    },
    {
      name: 'Prenatal Lab Testing',
      description: 'Specialized blood work and lab collections for expectant mothers, prioritizing comfort and privacy.',
      icon: FaHeartbeat,
    },
    {
      name: 'Full Blood Test Panels',
      description: 'Comprehensive panels covering a wide range of health markers as requested by your physician.',
      icon: FaMicroscope,
    },
    {
      name: 'Cholesterol Testing',
      description: 'Accurate and timely lipid panel collections to monitor heart health.',
      icon: FaPills,
    },
    {
      name: 'ECG (Electrocardiogram)',
      description: 'On-site ECG services for quick assessment of heart\'s electrical activity.',
      icon: FaHeartbeat,
    },
    {
      name: 'COVID-19 Testing (PCR & Rapid)',
      description: 'Efficient and reliable COVID-19 sample collection, including PCR and rapid antigen tests.',
      icon: FaSyringe,
    },
    {
      name: 'HIV and STD Screening',
      description: 'Confidential and discreet testing services for sexual health screenings.',
      icon: FaSearch,
    },
    {
      name: 'HCG and Pregnancy Testing',
      description: 'Quantitative HCG blood tests for early and accurate pregnancy confirmation.',
      icon: FaFlask,
    },
    {
      name: 'Drug and Food Allergy Sensitivity Testing',
      description: 'Specialized collections for comprehensive allergy and sensitivity panels.',
      icon: FaPills,
    },
    {
      name: 'Specialty Kit Collection',
      description: 'Experienced in handling and processing samples for various specialty lab kits from specific providers.',
      icon: FaMicroscope,
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center text-healthwise-teal mb-10">Our Services</h1>
      <p className="text-xl text-gray-700 text-center mb-12 max-w-3xl mx-auto">
        Health Wise Mobile Phlebotomy brings a comprehensive range of lab services directly to your home or office. Experience professional, convenient, and discreet sample collection tailored to your needs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col items-center text-center">
            {service.icon && (
              <service.icon className="text-healthwise-teal text-5xl mb-4" />
            )}
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{service.name}</h2>
            <p className="text-gray-600 leading-relaxed">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-lg text-gray-700">Don't see a specific service listed? <Link href="/contact" className="text-healthwise-teal font-semibold hover:underline">Contact us</Link> to discuss your needs.</p>
        <Link
          href="/book"
          className="mt-6 inline-block px-8 py-4 bg-healthwise-yellow text-healthwise-teal font-bold text-lg rounded-full shadow-lg hover:bg-yellow-400 transition-colors duration-300 transform hover:scale-105"
        >
          Schedule Your Appointment Now
        </Link>
      </div>
    </div>
  );
}