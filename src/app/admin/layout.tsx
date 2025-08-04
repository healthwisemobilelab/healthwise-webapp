// src/app/admin/layout.tsx
'use client';

import '../globals.css'; // Corrected path to the globals.css file
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Define the structure for the logged-in user
type User = {
  email: string;
  role: 'Admin' | 'Staff' | string;
};

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Check session storage for a logged-in user
    const loggedInUserStr = sessionStorage.getItem('healthwiseUser');
    if (loggedInUserStr) {
      setUser(JSON.parse(loggedInUserStr));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });
      const data = await response.json();
      if (data.success) {
        sessionStorage.setItem('healthwiseUser', JSON.stringify(data.user));
        setUser(data.user);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };
  
  const handleLogout = () => {
      sessionStorage.removeItem('healthwiseUser');
      setUser(null);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm font-sans">
          <h2 className="text-2xl font-bold mb-6 text-center text-sky-800 font-serif">Admin Portal</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
            <input id="email" type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
            <input id="password" type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" required />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded w-full">Sign In</button>
        </form>
      </div>
    );
  }
  
  // If a user IS logged in, show the main dashboard layout
  return (
    <div className="p-4 md:p-8">
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-sky-800 font-serif">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 font-sans">Logged in as: {user.email} ({user.role})</span>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">
                Log Out
            </button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
            <Link href="/admin" className={`${pathname === '/admin' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'} py-4 px-1 border-b-2 font-sans font-semibold`}>
                Dashboard
            </Link>
            <Link href="/admin/appointments" className={`${pathname.startsWith('/admin/appointments') ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'} py-4 px-1 border-b-2 font-sans font-semibold`}>
                Appointments
            </Link>
            <Link href="/admin/patients" className={`${pathname.startsWith('/admin/patients') ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'} py-4 px-1 border-b-2 font-sans font-semibold`}>
                Patients
            </Link>
            {/* We will add the other tabs here in the next steps */}
        </nav>
      </div>

      <div className="mt-8">
        {children}
      </div>
    </div>
  );
}

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminLayout>{children}</AdminLayout>
        </Suspense>
    )
}
