'use client';

import React, { useState, useEffect } from 'react';

interface Appointment {
  id: number; // We'll add an id internally to track rows
  data: string[]; // the row data array (all columns)
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    setLoading(true);
    try {
      const res = await fetch('/api/appointments');
      const json = await res.json();
      if (json.appointments) {
        // Add an id to each appointment for tracking
        const withIds = json.appointments.map((row: string[], idx: number) => ({
          id: idx,
          data: row,
        }));
        setAppointments(withIds);
      }
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatus(appointment: Appointment) {
    // Status column index (7 based on your columns)
    return appointment.data[7] || 'Pending';
  }

  // Update status handler
  async function updateStatus(appointment: Appointment, newStatus: string, reason?: string) {
    setUpdatingStatusId(appointment.id);
    try {
      const res = await fetch('/api/appointments/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex: appointment.id + 2, // +2 because Google Sheets starts at A2 and 0-based index
          status: newStatus,
          email: appointment.data[3],
          name: appointment.data[1],
          requestedDate: appointment.data[6],
          declineReason: reason || '',
        }),
      });
      const json = await res.json();
      if (json.success) {
        // Update local state for immediate UI update
        const updatedAppointments = appointments.map((appt) =>
          appt.id === appointment.id
            ? { ...appt, data: appt.data.map((val, i) => (i === 7 ? newStatus : val)) }
            : appt
        );
        setAppointments(updatedAppointments);
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status.');
    }
    setUpdatingStatusId(null);
  }

  // Handlers for button clicks
  function onConfirm(appointment: Appointment) {
    if (getStatus(appointment) === 'Confirmed') return; // no change
    updateStatus(appointment, 'Confirmed');
  }

  function onDecline(appointment: Appointment) {
    setSelectedAppointmentId(appointment.id);
    setDeclineReason('');
    setDeclineModalOpen(true);
  }

  function onCancelDecline() {
    setSelectedAppointmentId(null);
    setDeclineReason('');
    setDeclineModalOpen(false);
  }

  async function onSubmitDecline() {
    if (selectedAppointmentId === null) return;
    const appointment = appointments.find((a) => a.id === selectedAppointmentId);
    if (!appointment) return;

    if (declineReason.trim().length === 0) {
      alert('Please provide a reason for declining.');
      return;
    }

    await updateStatus(appointment, 'Declined', declineReason.trim());
    onCancelDecline();
  }

  return (
    <div className="p-6 max-w-full overflow-x-auto">
      <h1 className="text-3xl font-bold mb-6">Appointments</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full border border-gray-300 rounded-md">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="border px-3 py-2 text-left text-sm font-semibold">Timestamp</th>
              <th className="border px-3 py-2 text-left text-sm font-semibold">Name</th>
              <th className="border px-3 py-2 text-left text-sm font-semibold">Phone</th>
              <th className="border px-3 py-2 text-left text-sm font-semibold">Email</th>
              <th className="border px-3 py-2 text-left text-sm font-semibold">Address</th>
              <th className="border px-3 py-2 text-left text-sm font-semibold">Service</th>
              <th className="border px-3 py-2 text-left text-sm font-semibold">Requested Date</th>
              <th className="border px-3 py-2 text-left text-sm font-semibold">Status</th>
              <th className="border px-3 py-2 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr
                key={appointment.id}
                className={appointment.id % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {appointment.data.slice(0, 7).map((cell, idx) => (
                  <td key={idx} className="border px-3 py-2 text-sm whitespace-nowrap">
                    {cell}
                  </td>
                ))}
                <td className="border px-3 py-2 text-sm whitespace-nowrap font-semibold">
                  {getStatus(appointment)}
                </td>
                <td className="border px-3 py-2 text-center space-x-2 whitespace-nowrap">
                  <button
                    disabled={updatingStatusId === appointment.id || getStatus(appointment) === 'Confirmed'}
                    onClick={() => onConfirm(appointment)}
                    className={`px-2 py-1 rounded text-white font-semibold ${
                      getStatus(appointment) === 'Confirmed' ? 'bg-green-600 cursor-not-allowed' : 'bg-green-500 hover:bg-green-700'
                    }`}
                  >
                    Confirm
                  </button>
                  <button
                    disabled={updatingStatusId === appointment.id || getStatus(appointment) === 'Declined'}
                    onClick={() => onDecline(appointment)}
                    className={`px-2 py-1 rounded text-white font-semibold ${
                      getStatus(appointment) === 'Declined' ? 'bg-red-600 cursor-not-allowed' : 'bg-red-500 hover:bg-red-700'
                    }`}
                  >
                    Decline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Decline Reason Modal */}
      {declineModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Decline Appointment</h2>
            <textarea
              rows={4}
              className="w-full border rounded px-3 py-2 mb-4 resize-none"
              placeholder="Please enter reason for declining this appointment"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancelDecline}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={onSubmitDecline}
                className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Submit Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
