// src/app/admin/appointments/page.tsx
'use client';

import { useEffect, useState } from 'react';

// Define the structure for an Appointment
type Appointment = {
  rowIndex: number;
  name: string;
  requestedDate: string;
  status: string;
  paymentStatus: string;
  depositStatus: string;
};

// Define the structure for the logged-in user
type User = {
  email: string;
  role: 'Admin' | 'Staff' | string;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get the current user from session storage to include in API calls
    const loggedInUserStr = sessionStorage.getItem('healthwiseUser');
    if (loggedInUserStr) {
      setUser(JSON.parse(loggedInUserStr));
    }
  }, []);

  const fetchAppointments = () => {
    setIsLoading(true);
    fetch('/api/appointments', { cache: 'no-store' })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch appointments');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
            setAppointments(data);
        } else {
            setError('Received invalid data from the server.');
            setAppointments([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch appointments", err);
        setError('Could not load appointment data. Please try refreshing the page.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAdminAction = async (actionType: string, payload: any) => {
    await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType, payload, user }),
    });
    // After any action, refresh all data to ensure UI is in sync
    fetchAppointments();
  };

  const handleStatusUpdate = async (rowIndex: number, newStatus: 'Confirmed' | 'Declined') => {
    await handleAdminAction('UPDATE_STATUS', { rowIndex, newStatus });
  };

  if (isLoading) {
    return <div>Loading appointments...</div>;
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
            <th className="py-3 px-4 text-left">Requested Date</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Payment Method</th>
            <th className="py-3 px-4 text-left">Deposit Status</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {appointments.map((app) => (
            <tr key={app.rowIndex} className="border-b hover:bg-gray-100">
              <td className="py-3 px-4">{app.name}</td>
              <td className="py-3 px-4">{app.requestedDate}</td>
              <td className="py-3 px-4">
                <span className={`py-1 px-3 rounded-full text-xs font-semibold ${app.status === 'Confirmed' ? 'bg-green-200 text-green-800' : app.status === 'Declined' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                  {app.status}
                </span>
              </td>
              <td className="py-3 px-4">{app.paymentStatus}</td>
              <td className="py-3 px-4">
                {app.paymentStatus.includes('Deposit Required') ? (
                  <span className={`font-bold ${app.depositStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                    {app.depositStatus || 'Unpaid'}
                  </span>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </td>
              <td className="py-3 px-4 space-x-2">
                <button 
                  onClick={() => handleStatusUpdate(app.rowIndex, 'Confirmed')}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-2 rounded"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => handleStatusUpdate(app.rowIndex, 'Declined')}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-2 rounded"
                >
                  Decline
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
