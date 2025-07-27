// src/app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';

type Appointment = {
  rowIndex: number;
  name: string;
  phone: string;
  service: string;
  requestedDate: string;
  status: string;
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    if (loggedIn) {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchAppointments = () => {
    setIsLoading(true);
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch appointments", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  const handleStatusUpdate = async (rowIndex: number, newStatus: 'Confirmed' | 'Declined') => {
    setAppointments(currentAppointments =>
      currentAppointments.map(app =>
        app.rowIndex === rowIndex ? { ...app, status: newStatus } : app
      )
    );

    await fetch('/api/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rowIndex, newStatus }),
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'HealthWise2025!') {
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      setIsAuthenticated(true);
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center text-sky-800">Admin Login</h2>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input id="password" type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded w-full">Sign In</button>
        </form>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-sky-800">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">Review and manage appointment requests.</p>
        </div>
        <button onClick={fetchAppointments} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">Refresh</button>
      </div>
      
      <div className="mt-8 overflow-x-auto">
        {isLoading ? (
          <p>Loading appointments...</p>
        ) : (
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-sky-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Requested Date</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {appointments.length > 0 ? (
                appointments.map((app) => (
                  <tr key={app.rowIndex} className="border-b hover:bg-gray-100">
                    <td className="py-3 px-4">{app.name}</td>
                    <td className="py-3 px-4">{app.phone}</td>
                    <td className="py-3 px-4">{app.requestedDate}</td>
                    <td className="py-3 px-4">
                      <span className={`py-1 px-3 rounded-full text-xs font-semibold ${
                        app.status === 'Confirmed' ? 'bg-green-200 text-green-800' :
                        app.status === 'Declined' ? 'bg-red-200 text-red-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-x-2">
                      <button onClick={() => handleStatusUpdate(app.rowIndex, 'Confirmed')} className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1 px-2 rounded">Confirm</button>
                      <button onClick={() => handleStatusUpdate(app.rowIndex, 'Declined')} className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-1 px-2 rounded">Decline</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">No pending appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
