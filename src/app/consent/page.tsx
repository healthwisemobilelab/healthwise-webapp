// src/app/consent/page.tsx
import React from 'react';

export default function ConsentPage() {
  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-teal-700 mb-8 font-serif">
          Consent & Waiver Forms
        </h1>
        <div className="prose prose-lg text-gray-600 mx-auto font-sans">
          <h2 className="text-teal-600 font-serif">Consent to Treatment</h2>
          <p>
            This section will contain the full text for the "Consent to Treatment and Associated Medical Procedures" form. You can replace this placeholder text with your official legal document. By checking the box on the booking form, the patient acknowledges they have read and agreed to these terms.
          </p>
          
          <h2 className="text-teal-600 font-serif mt-8">HIPAA Notice of Privacy Practices</h2>
          <p>
            This section will contain the full text for your HIPAA Notice of Privacy Practices. You can replace this placeholder text with your official legal document.
          </p>

          <h2 className="text-teal-600 font-serif mt-8">Financial Responsibility Policy</h2>
          <p>
            This section will contain the full text for your Financial Responsibility Policy. You can replace this placeholder text with your official legal document.
          </p>
        </div>
      </div>
    </div>
  );
}
