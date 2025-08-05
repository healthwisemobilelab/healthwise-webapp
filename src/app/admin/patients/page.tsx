// src/app/admin/patients/page.tsx
'use client';

import { useEffect, useState } from 'react';
import PhlebotomistReportForm, { ReportData } from '@/components/PhlebotomistReportForm';
import SendResultsForm from '@/components/SendResultsForm';

// Define the structure for the logged-in user
type User = {
  email: string;
  role: 'Admin' | 'Staff' | string;
};

// Define the structure for a Patient
type Patient = {
  name: string;
  phone: string;
  email: string;
  address: string;
  dateOfBirth: string;
  nationalInsurance: string;
  maritalStatus: string;
  occupation: string;
};

// Define the structure for an Appointment
type Appointment = {
  rowIndex: number;
  name: string;
  email: string;
  requestedDate: string;
  service: string;
  status: string;
  paymentStatus: string;
  depositStatus: string;
  requisitionFileLink: string;
  visitNotes: string;
  physicianInfo: string;
  reportFileLink: string;
};

const ViewReport = ({ appointment, patient, onClose }: { appointment: Appointment, patient: Patient, onClose: () => void }) => {
  if (appointment.reportFileLink) {
    return (
       <div className="p-4 md:p-8">
        <button onClick={onClose} className="text-teal-600 hover:text-teal-800 font-semibold mb-4">&larr; Back to Patient Profile</button>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-sky-800 font-serif">Viewing Report PDF</h2>
          <p className="mt-4 text-gray-600 font-sans">The report for this visit has been saved as a PDF.</p>
          <a href={appointment.reportFileLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-700">
            Open Report PDF in New Tab
          </a>
        </div>
      </div>
    )
  }
  
  let reportData: Partial<ReportData> = {};
  try {
    reportData = JSON.parse(appointment.visitNotes);
  } catch (e) {
    return (
      <div className="p-4 md:p-8">
        <button onClick={onClose} className="text-teal-600 hover:text-teal-800 font-semibold mb-4">&larr; Back to Patient Profile</button>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-sky-800">Report for {appointment.requestedDate}</h2>
          <p className="mt-4 text-gray-700">{appointment.visitNotes || "No detailed report data found for this visit."}</p>
        </div>
      </div>
    );
  }
  const checkedSpecimens = Object.entries(reportData.specimenTypes || {}).filter(([, checked]) => checked).map(([type]) => type).join(', ');
  const checkedTransportedTo = Object.entries(reportData.transportedTo || {}).filter(([, checked]) => checked).map(([lab]) => lab).join(', ');
  return (
    <div className="p-4 md:p-8">
      <button onClick={onClose} className="text-teal-600 hover:text-teal-800 font-semibold mb-4">&larr; Back to Patient Profile</button>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-sky-800">Report for {appointment.requestedDate}</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 font-sans">
          <div><strong>Ordering Physician:</strong> {reportData.orderingPhysician || 'N/A'}</div>
          <div><strong>Received By:</strong> {reportData.receivedBy || 'N/A'}</div>
          <div className="md:col-span-2"><strong>Specimens:</strong> {checkedSpecimens || 'None'}</div>
          <div className="md:col-span-2"><strong>Transported To:</strong> {checkedTransportedTo || 'None'}</div>
          <div className="md:col-span-2"><strong>Notes:</strong> {reportData.notes || 'N/A'}</div>
          <div className="md:col-span-2 border-t pt-4 mt-4"><h3 className="font-semibold text-lg mb-2">Emergency Contact</h3><p><strong>Name:</strong> {reportData.emergencyContactName || 'N/A'}</p><p><strong>Relationship:</strong> {reportData.emergencyContactRelationship || 'N/A'}</p></div>
          <div className="border-t pt-4 mt-4"><strong>Status:</strong> {reportData.reportStatus || 'N/A'}</div>
          <div className="border-t pt-4 mt-4"><strong>Signature:</strong> {reportData.phlebotomistSignature || 'Not Signed'}</div>
        </div>
      </div>
    </div>
  );
};


export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editablePatientData, setEditablePatientData] = useState<Patient | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [isSendResultsOpen, setIsSendResultsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loggedInUserStr = sessionStorage.getItem('healthwiseUser');
    if (loggedInUserStr) {
      setUser(JSON.parse(loggedInUserStr));
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [patientsRes, appointmentsRes] = await Promise.all([
            fetch('/api/patients', { cache: 'no-store' }),
            fetch('/api/appointments', { cache: 'no-store' })
        ]);
        const patientData = await patientsRes.json();
        const appointmentData = await appointmentsRes.json();

        if (Array.isArray(patientData)) setPatients(patientData);
        else setPatients([]);
        if (Array.isArray(appointmentData)) setAppointments(appointmentData);
        else setAppointments([]);
    } catch (err) {
        console.error("Failed to fetch data", err);
        setError('Could not load data. Please try refreshing.');
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const logAction = async (action: string, details: string) => {
    const loggedInUserStr = sessionStorage.getItem('healthwiseUser');
    if (!loggedInUserStr) return;
    const currentUser = JSON.parse(loggedInUserStr);

    await fetch('/api/log-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: currentUser.email, action, details }),
    });
  };

  useEffect(() => {
    if (selectedPatient && user) {
      setEditablePatientData(selectedPatient);
      logAction('Viewed Patient Profile', `Viewed profile for ${selectedPatient.name}`);
    }
  }, [selectedPatient, user]);
  
  const handleAdminAction = async (actionType: string, payload: any) => {
    const loggedInUserStr = sessionStorage.getItem('healthwiseUser');
    if (!loggedInUserStr) {
        alert("Session error: Please log out and log back in.");
        return;
    }
    const currentUser = JSON.parse(loggedInUserStr);

    await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType, payload, user: currentUser }),
    });
  };

  const handlePatientDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editablePatientData) return;
    setEditablePatientData({ ...editablePatientData, [e.target.name]: e.target.value });
  };

  const handlePatientDetailsSave = async () => {
    if (!editablePatientData) return;
    setIsSaving(true);
    const firstAppointment = appointments.find(app => app.email === editablePatientData.email);
    if (firstAppointment) {
        await handleAdminAction('SAVE_PATIENT_DETAILS', { rowIndex: firstAppointment.rowIndex, patientData: editablePatientData });
    }
    await fetchData();
    setIsSaving(false);
    alert('Patient details saved successfully!');
  };

  const handleDepositStatusUpdate = async (rowIndex: number) => {
    // THIS IS THE FIX: Optimistically update the UI for an instant visual change
    setAppointments(currentAppointments =>
      currentAppointments.map(app =>
        app.rowIndex === rowIndex ? { ...app, depositStatus: 'Paid' } : app
      )
    );
    // Then, send the update to the backend and refresh the data from the source of truth
    await handleAdminAction('UPDATE_DEPOSIT_STATUS', { rowIndex, newStatus: 'Paid' });
    await fetchData();
  };

  const handleReportSave = async (reportData: ReportData) => {
    if (!editingAppointment || !selectedPatient) return;
    setIsSaving(true);
    
    await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            patient: selectedPatient, 
            reportData: reportData, 
            appointment: editingAppointment 
        }),
    });
    
    setEditingAppointment(null);
    await fetchData(); 
    setIsSaving(false);
    alert('Phlebotomist report has been generated and saved as a PDF.');
  };

  const handleReportExport = (reportData: ReportData) => { /* Logic to be added */ };

  if (editingAppointment) {
    return (
        <div className="p-4 md:p-8">
            <button onClick={() => setEditingAppointment(null)} className="text-teal-600 hover:text-teal-800 font-semibold mb-4">&larr; Back to Patient Profile</button>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-3xl font-bold text-sky-800 font-serif">Edit Phlebotomist Report</h2>
                <p className="text-gray-500 font-sans">For visit on: {editingAppointment.requestedDate}</p>
                <div className="mt-8">
                    <PhlebotomistReportForm 
                        initialData={editingAppointment.visitNotes || ''}
                        onSave={handleReportSave}
                        onExport={handleReportExport}
                        isSaving={isSaving}
                    />
                </div>
            </div>
        </div>
    );
  }

  if (viewingAppointment && selectedPatient) {
    return <ViewReport appointment={viewingAppointment} patient={selectedPatient} onClose={() => setViewingAppointment(null)} />;
  }

  if (selectedPatient && editablePatientData) {
    const patientAppointments = appointments.filter(app => (app.email && app.email === selectedPatient.email) || app.name === selectedPatient.name);
    return (
      <div className="p-4 md:p-8">
        {isSendResultsOpen && <SendResultsForm patient={selectedPatient} onClose={() => setIsSendResultsOpen(false)} logAction={logAction} />}
        <button onClick={() => setSelectedPatient(null)} className="text-teal-600 hover:text-teal-800 font-semibold mb-4">&larr; Back to Patient List</button>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-sky-800 font-serif">{selectedPatient.name}</h2>
              <p className="text-gray-500 font-sans">{selectedPatient.email}</p>
            </div>
            <div className="flex space-x-2">
                <button onClick={() => setIsSendResultsOpen(true)} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700">Send Lab Results</button>
                <button onClick={handlePatientDetailsSave} disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-400">{isSaving ? 'Saving...' : 'Save Details'}</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4 border-t pt-4 font-sans">
            <div className="space-y-2"><label className="text-sm font-semibold">Phone</label><input name="phone" value={editablePatientData.phone} onChange={handlePatientDetailChange} className="w-full p-2 border rounded-md" /></div>
            <div className="space-y-2"><label className="text-sm font-semibold">Address</label><input name="address" value={editablePatientData.address} onChange={handlePatientDetailChange} className="w-full p-2 border rounded-md" /></div>
            <div className="space-y-2"><label className="text-sm font-semibold">Date of Birth</label><input name="dateOfBirth" value={editablePatientData.dateOfBirth} onChange={handlePatientDetailChange} className="w-full p-2 border rounded-md" /></div>
            <div className="space-y-2"><label className="text-sm font-semibold">National Insurance</label><input name="nationalInsurance" value={editablePatientData.nationalInsurance} onChange={handlePatientDetailChange} className="w-full p-2 border rounded-md" /></div>
            <div className="space-y-2"><label className="text-sm font-semibold">Marital Status</label><select name="maritalStatus" value={editablePatientData.maritalStatus} onChange={handlePatientDetailChange} className="w-full p-2 border rounded-md"><option>Single</option><option>Married</option><option>Other</option></select></div>
            <div className="space-y-2"><label className="text-sm font-semibold">Occupation</label><input name="occupation" value={editablePatientData.occupation} onChange={handlePatientDetailChange} className="w-full p-2 border rounded-md" /></div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4 font-serif">Appointment History</h3>
            {patientAppointments.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {patientAppointments.map(app => (
                  <div key={app.rowIndex} className="p-3 bg-gray-50 rounded-md font-sans">
                     <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{app.requestedDate} - {app.service}</p>
                            <p className="text-sm text-gray-500">Status: {app.status}</p>
                            <p className="text-sm text-gray-600 font-medium">Payment: {app.paymentStatus}
                                {app.paymentStatus.includes('Deposit Required') && (
                                    <span className={`ml-2 font-bold ${app.depositStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                                        (Deposit: {app.depositStatus || 'Unpaid'})
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {app.paymentStatus.includes('Deposit Required') && app.depositStatus !== 'Paid' && (
                                <button onClick={() => handleDepositStatusUpdate(app.rowIndex)} className="px-3 py-1 bg-yellow-400 text-yellow-800 text-sm font-semibold rounded-md hover:bg-yellow-500">Mark Deposit Paid</button>
                            )}
                            <button onClick={() => setViewingAppointment(app)} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-md hover:bg-blue-200">View</button>
                            <button onClick={() => setEditingAppointment(app)} className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-300">Edit</button>
                        </div>
                    </div>
                    {app.requisitionFileLink && (<div className="mt-2 pt-2 border-t"><a href={app.requisitionFileLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View Uploaded Requisition Form</a></div>)}
                    {app.reportFileLink && (<div className="mt-2 pt-2 border-t"><a href={app.reportFileLink} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline font-semibold">View Saved Report PDF</a></div>)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 font-sans">No appointments found for this patient.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

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
                <button onClick={() => setSelectedPatient(patient)} className="text-teal-600 hover:underline font-semibold text-left">
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