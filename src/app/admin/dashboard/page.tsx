// src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';

// Define specific types for our data for better type safety
type Patient = {
  name: string;
  email: string;
};

type Appointment = {
  name:string;
  email: string;
  requestedDate: string;
  service: string;
  paymentStatus: string;
  depositStatus: string;
};

// A small component for the statistic cards
const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className="bg-sky-100 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// --- FIX START: Centralized date parsing function ---
// This helper function reliably parses the date string to avoid errors.
const parseDateString = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  // This assumes a format like "Month Day, Year" e.g., "August 7, 2025"
  const parts = dateStr.replace(/,/g, '').split(' '); // Remove commas and split by space
  if (parts.length < 3) return null;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthIndex = monthNames.findIndex(m => m.toLowerCase() === parts[0].toLowerCase());
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (monthIndex === -1 || isNaN(day) || isNaN(year)) {
    console.warn("Could not parse date:", dateStr);
    return null;
  }
  return new Date(year, monthIndex, day);
};
// --- FIX END ---

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    depositsRequired: 0,
  });
  // The state will now hold appointments with their parsed dates
  const [upcomingAppointments, setUpcomingAppointments] = useState<(Appointment & { parsedDate: Date })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [patientsRes, appointmentsRes] = await Promise.all([
        fetch('/api/patients', { cache: 'no-store' }),
        fetch('/api/appointments', { cache: 'no-store' })
      ]);

      if (!patientsRes.ok || !appointmentsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const patients: Patient[] = await patientsRes.json();
      const appointments: Appointment[] = await appointmentsRes.json();

      // Calculate stats
      const depositsNeeded = appointments.filter(
        app => app.paymentStatus.includes('Deposit Required') && app.depositStatus !== 'Paid'
      ).length;

      setStats({
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        depositsRequired: depositsNeeded,
      });

      // --- FIX START: Use the helper function for filtering and sorting ---
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to midnight, local time.

      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);

      const upcoming = appointments
        .map(app => ({
          ...app,
          parsedDate: parseDateString(app.requestedDate) // Parse the date once
        }))
        .filter((app): app is Appointment & { parsedDate: Date } => {
          // Filter out any appointments where the date could not be parsed
          if (!app.parsedDate) return false;
          return app.parsedDate >= today && app.parsedDate < sevenDaysFromNow;
        })
        .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
      // --- FIX END ---
      
      setUpcomingAppointments(upcoming);

    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setError('Could not load dashboard data. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-sky-800 font-serif">Dashboard Overview</h1>
      <p className="mt-2 text-gray-600 font-sans">
        A summary of your key operational metrics.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <StatCard 
          title="Total Patients" 
          value={stats.totalPatients}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <StatCard 
          title="Total Appointments" 
          value={stats.totalAppointments}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <StatCard 
          title="Pending Deposits" 
          value={stats.depositsRequired}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 14v1m0-6v.01M12 14c-1.657 0-3-.895-3-2s1.343-2 3-2 3-.895 3-2-1.343-2-3-2m0 8c-1.11 0-2.08-.402-2.599-1M12 14c1.657 0 3 .895 3 2s-1.343 2-3 2m0-8c-1.11 0-2.08-.402-2.599-1" /></svg>}
        />
      </div>
      
      {/* Upcoming Appointments List */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-700 font-serif">Upcoming Appointments (Next 7 Days)</h2>
        <div className="mt-4 bg-white shadow-md rounded-lg p-4">
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((app, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-md border-l-4 border-teal-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{app.name}</p>
                      <p className="text-sm text-gray-600">{app.service}</p>
                    </div>
                    <div className="text-right">
                      {/* --- FIX START: Use the pre-parsed date object --- */}
                      <p className="font-semibold text-teal-700">{app.parsedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      {/* --- FIX END --- */}
                      <p className="text-sm text-gray-500">{app.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 font-sans p-4 text-center">No appointments scheduled in the next 7 days.</p>
          )}
        </div>
      </div>
    </div>
  );
}
