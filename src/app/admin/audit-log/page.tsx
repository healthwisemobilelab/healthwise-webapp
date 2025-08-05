// src/app/admin/audit-log/page.tsx
'use client';

import { useEffect, useState } from 'react';

// Define the structure for an AuditLogEntry
type AuditLogEntry = {
  timestamp: string;
  userEmail: string;
  action: string;
  details: string;
};

export default function AuditLogPage() {
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAuditLog = () => {
    setIsLoading(true);
    fetch('/api/audit-log', { cache: 'no-store' })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch audit log');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
            setAuditLog(data);
        } else {
            setError('Received invalid data from the server.');
            setAuditLog([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch audit log", err);
        setError('Could not load audit log data. Please try refreshing the page.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchAuditLog();
  }, []);

  if (isLoading) {
    return <div className="font-sans">Loading audit log...</div>;
  }

  if (error) {
    return <div className="text-red-500 font-sans">{error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg font-sans">
        <thead className="bg-sky-800 text-white">
          <tr>
            <th className="py-3 px-4 text-left">Timestamp</th>
            <th className="py-3 px-4 text-left">User</th>
            <th className="py-3 px-4 text-left">Action</th>
            <th className="py-3 px-4 text-left">Details</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {auditLog.map((log, index) => (
            <tr key={index} className="border-b hover:bg-gray-100">
              <td className="py-3 px-4 text-sm">{log.timestamp}</td>
              <td className="py-3 px-4 text-sm">{log.userEmail}</td>
              <td className="py-3 px-4 text-sm font-semibold">{log.action}</td>
              <td className="py-3 px-4 text-sm">{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}