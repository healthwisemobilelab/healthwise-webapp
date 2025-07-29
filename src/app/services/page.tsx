// src/app/services/page.tsx
import React from 'react';
import { FaVial, FaHeartbeat, FaBaby, FaStethoscope, FaLungs, FaVenusMars, FaAllergies } from 'react-icons/fa';

const services = [
  { name: 'Routine Annual Blood Draws', description: 'Standard blood collection for regular check-ups and monitoring health conditions.', icon: <FaVial /> },
  { name: 'Vital Signs', description: 'Includes checks for blood pressure, blood glucose, and determining blood type.', icon: <FaHeartbeat /> },
  { name: 'Prenatal Lab Testing', description: 'Comprehensive and gentle testing for expectant mothers throughout their pregnancy journey.', icon: <FaBaby /> },
  { name: 'Full Blood Test Panels', description: 'Complete panels to provide a detailed overview of your health, from CBC to metabolic panels.', icon: <FaStethoscope /> },
  { name: 'Cholesterol Testing', description: 'Accurate lipid panel testing to monitor and manage cardiovascular health.', icon: <FaHeartbeat /> },
  { name: 'ECG', description: 'Electrocardiogram services to monitor your heart\'s electrical activity in a comfortable setting.', icon: <FaHeartbeat /> },
  { name: 'COVID, HIV & STD Screening', description: 'Discreet and confidential screening for a range of infectious diseases.', icon: <FaLungs /> },
  { name: 'HCG & Pregnancy Testing', description: 'Fast and reliable human chorionic gonadotropin (HCG) testing to confirm pregnancy.', icon: <FaVenusMars /> },
  { name: 'Drug & Food Allergy Testing', description: 'Comprehensive sensitivity and allergy testing to identify triggers and improve your quality of life.', icon: <FaAllergies /> },
];

export default function ServicesPage() {
  return (
    <div className="bg-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-teal-700">
            Our Phlebotomy Services
          </h1>
          <p className="mt-4 text-lg text-gray-600 font-sans max-w-2xl mx-auto">
            We provide a wide range of professional and confidential lab collection services, all in the convenience of your chosen location.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.name} className="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
              <div className="text-4xl text-teal-600 mb-4">{service.icon}</div>
              <h2 className="text-xl font-serif font-semibold text-gray-800">{service.name}</h2>
              <p className="mt-2 text-gray-600 font-sans flex-grow">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
