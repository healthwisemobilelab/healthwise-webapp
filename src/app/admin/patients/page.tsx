// src/app/admin/patients/page.tsx
'use client';

import { useEffect, useState } from 'react';

// Define the structure for a Patient
type Patient = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPatients = () => {
    setIsLoading(true);
    fetch('/api/patients', { cache: 'no-store' })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch patients');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
            setPatients(data);
        } else {
            setError('Received invalid data from the server.');
            setPatients([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch patients", err);
        setError('Could not load patient data. Please try refreshing the page.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  if (isLoading) {
    return <div>Loading patients...</div>;
  }

  if (error) {
    return <div className="text-red-500 font-sans">{error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg font-sans">
        <thead className="bg-sky-800 text-white">
          <tr>
            <th className="py-3 px-4 text-left">Name</th>
            <th className="py-3 px-4 text-left">Email</th>
            <th className="py-3 px-4 text-left">Phone</th>
            <th className="py-3 px-4 text-left">Address</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {patients.map((patient, index) => (
            <tr key={index} className="border-b hover:bg-gray-100">
              <td className="py-3 px-4">
                {/* This button will open the patient profile in a future step */}
                <button className="text-teal-600 hover:underline font-semibold">
                  {patient.name}
                </button>
              </td>
              <td className="py-3 px-4">{patient.email}</td>
              <td className="py-3 px-4">{patient.phone}</td>
              <td className="py-3 px-4">{patient.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
