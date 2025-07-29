// src/app/admin/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PhlebotomistReportForm, { ReportData } from '@/components/PhlebotomistReportForm';
import SendResultsForm from '@/components/SendResultsForm';

// Define the structure for the logged-in user
type User = {
  email: string;
  role: 'Admin' | 'Staff' | string;
};

type Appointment = {
  rowIndex: number; name: string; phone: string; email: string; service: string;
  requestedDate: string; status: string; physicianInfo: string; visitNotes: string;
  requisitionFileLink: string;
  paymentStatus: string;
  depositStatus: string;
};

type Patient = {
  name: string; phone: string; email: string; address: string;
  dateOfBirth: string; nationalInsurance: string; maritalStatus: string; occupation: string;
};

type AuditLogEntry = {
    timestamp: string;
    userEmail: string;
    action: string;
    details: string;
};

type AdminTab = 'appointments' | 'patients' | 'audit-log';

const ViewReport = ({ appointment, patient, onClose }: { appointment: Appointment, patient: Patient, onClose: () => void }) => {
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
          <div className="md:col-span-2 border-t pt-4 mt-4">
            <h3 className="font-semibold text-lg mb-2">Emergency Contact</h3>
            <p><strong>Name:</strong> {reportData.emergencyContactName || 'N/A'}</p>
            <p><strong>Relationship:</strong> {reportData.emergencyContactRelationship || 'N/A'}</p>
          </div>
          <div className="border-t pt-4 mt-4"><strong>Status:</strong> {reportData.reportStatus || 'N/A'}</div>
          <div className="border-t pt-4 mt-4"><strong>Signature:</strong> {reportData.phlebotomistSignature || 'Not Signed'}</div>
        </div>
      </div>
    </div>
  );
};

function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('appointments');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [isSendResultsOpen, setIsSendResultsOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editablePatientData, setEditablePatientData] = useState<Patient | null>(null);
  
  const searchParams = useSearchParams();
  const authStatus = searchParams.get('auth');

  const logAction = async (action: string, details: string) => {
    if (!user) return;
    await fetch('/api/log-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: user.email, action, details }),
    });
  };

  useEffect(() => {
    const loggedInUserStr = sessionStorage.getItem('healthwiseUser');
    if (loggedInUserStr) {
      setUser(JSON.parse(loggedInUserStr));
    }
  }, []);

  const fetchAllData = () => {
    setIsLoading(true);
    const apiCalls = [
        fetch('/api/appointments').then(res => res.json()),
        fetch('/api/patients').then(res => res.json())
    ];

    // Only fetch the audit log if the user is an Admin
    if (user?.role === 'Admin') {
        apiCalls.push(fetch('/api/audit-log').then(res => res.json()));
    }

    Promise.all(apiCalls).then(([appointmentData, patientData, auditLogData]) => {
      setAppointments(appointmentData);
      setPatients(patientData);
      if (auditLogData) {
        setAuditLog(auditLogData);
      }
      setIsLoading(false);
    }).catch(err => {
      console.error("Failed to fetch admin data", err);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPatient) {
      setEditablePatientData(selectedPatient);
      logAction('Viewed Patient Profile', `Viewed profile for ${selectedPatient.name}`);
    }
  }, [selectedPatient]);

  const handlePatientDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editablePatientData) return;
    const { name, value } = e.target;
    setEditablePatientData({ ...editablePatientData, [name]: value });
  };

  const handlePatientDetailsSave = async () => {
    if (!editablePatientData) return;
    setIsSaving(true);
    const firstAppointment = appointments.find(app => app.email === editablePatientData.email);
    if (firstAppointment) {
      await fetch('/api/update-patient-details', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex: firstAppointment.rowIndex, patientData: editablePatientData }),
      });
    }
    setPatients(patients.map(p => p.email === editablePatientData.email ? editablePatientData : p));
    setSelectedPatient(editablePatientData);
    setIsSaving(false);
    alert('Patient details saved successfully!');
    logAction('Updated Patient Details', `Saved details for ${editablePatientData.name}`);
  };

  const handleStatusUpdate = async (rowIndex: number, newStatus: 'Confirmed' | 'Declined') => {
    const appointment = appointments.find(app => app.rowIndex === rowIndex);
    await fetch('/api/update-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rowIndex, newStatus }),
    });
    logAction('Updated Appointment Status', `Set status to ${newStatus} for ${appointment?.name} on ${appointment?.requestedDate}`);
    fetchAllData();
  };
  
  const handleDepositStatusUpdate = async (rowIndex: number) => {
    const appointment = appointments.find(app => app.rowIndex === rowIndex);
    await fetch('/api/update-deposit-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rowIndex, newStatus: 'Paid' }),
    });
    logAction('Updated Deposit Status', `Marked deposit as Paid for ${appointment?.name} on ${appointment?.requestedDate}`);
    fetchAllData();
  };

  const handleReportSave = async (reportData: ReportData) => {
    if (!editingAppointment) return;
    setIsSaving(true);
    const visitNotesString = JSON.stringify(reportData);
    await fetch('/api/update-patient-notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        rowIndex: editingAppointment.rowIndex, 
        physicianInfo: reportData.orderingPhysician, 
        visitNotes: visitNotesString 
      }),
    });
    setEditingAppointment(null);
    alert('Phlebotomist report saved successfully!');
    logAction('Saved Phlebotomist Report', `Saved report for ${editingAppointment.name} on ${editingAppointment.requestedDate}`);
    fetchAllData();
  };

  const handleReportExport = (reportData: ReportData) => {
    if (!selectedPatient) return;
    const checkedSpecimens = Object.entries(reportData.specimenTypes).filter(([, c]) => c).map(([t]) => t).join(', ');
    const checkedTransportedTo = Object.entries(reportData.transportedTo).filter(([, c]) => c).map(([l]) => l).join(', ');
    const reportText = `PHLEBOTOMIST REPORT\n------------------\nPATIENT: ${selectedPatient.name}\nEMAIL: ${selectedPatient.email}\nPHONE: ${selectedPatient.phone}\nDOB: ${selectedPatient.dateOfBirth}\n------------------\nPHYSICIAN: ${reportData.orderingPhysician}\nNOTES: ${reportData.notes}\nSPECIMENS: ${checkedSpecimens}\nTRANSPORTED TO: ${checkedTransportedTo}\n------------------\nEMERGENCY CONTACT: ${reportData.emergencyContactName} (${reportData.emergencyContactRelationship})\n------------------\nSTATUS: ${reportData.reportStatus}\nSIGNATURE: ${reportData.phlebotomistSignature}`;
    const mailtoLink = `mailto:?subject=Phlebotomist Report for ${selectedPatient.name}&body=${encodeURIComponent(reportText)}`;
    window.location.href = mailtoLink;
    logAction('Exported Report', `Exported report for ${selectedPatient.name}`);
  };

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
        logAction('User Login', `User ${emailInput} logged in successfully.`);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center text-sky-800">Admin Login</h2>
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
  
  if (editingAppointment) {
    return (
        <div className="p-4 md:p-8">
            <button onClick={() => setEditingAppointment(null)} className="text-teal-600 hover:text-teal-800 font-semibold mb-4">
                &larr; Back to Patient Profile
            </button>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-3xl font-bold text-sky-800">Edit Phlebotomist Report</h2>
                <p className="text-gray-500">For visit on: {editingAppointment.requestedDate}</p>
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
    const patientAppointments = appointments.filter(app => app.email === selectedPatient.email);
    return (
      <div className="p-4 md:p-8">
        {isSendResultsOpen && <SendResultsForm patient={selectedPatient} onClose={() => setIsSendResultsOpen(false)} logAction={logAction} />}
        <button onClick={() => setSelectedPatient(null)} className="text-teal-600 hover:text-teal-800 font-semibold mb-4">&larr; Back to Patient List</button>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div><h2 className="text-3xl font-bold text-sky-800">{selectedPatient.name}</h2><p className="text-gray-500">{selectedPatient.email}</p></div>
            <div className="flex space-x-2"><button onClick={() => setIsSendResultsOpen(true)} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700">Send Lab Results</button><button onClick={handlePatientDetailsSave} disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-400">{isSaving ? 'Saving...' : 'Save Details'}</button></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4 border-t pt-4">
            <div className="space-y-2"><label className="text-sm font-semibold">Phone</label><input name="phone" value={editablePatientData.phone} onChange={handlePatientDetailChange} className="w-full p-2 border rounded-md" /></div>
            <div className="space-y-2"><label className="text-sm font-semibold">Address</label><input name="address" value={editablePatientData.address} onChange={handlePatientDetailChange} className="w-full p-2 border rounded-md" /></div>
            <div className="space-y-2"><label className="text-sm font-semibold">Date of Birth</label><input name="dateOfBirth" value={editablePatientData.dateOfBirth} onChange={handlePatientDetailChange} className="w-full p-2 border rounded-md" /></div>
            <div className="space-y-2"><label className="text-sm font-semibold">National Insurance</label><input name="nationalInsurance" value={editablePatientData.nationalInsurance} onChange={handlePatientDetailChange} className="w-full p-2 border rounded-md" /></div>
            <div className="space-y-2"><label className="text-sm font-semibold">Marital Status</label><select name="maritalStatus" value={editablePatientData.maritalStatus} onChange={handlePatientDetailChange} className="w-full p-2 border rounded-md"><option>Single</option><option>Married</option><option>Other</option></select></div>
            <div className="space-y-2"><label className="text-sm font-semibold">Occupation</label><input name="occupation" value={editablePatientData.occupation} onChange={handlePatientDetailChange} className="w-full p-2 border rounded-md" /></div>
          </div>
          <div className="mt-8">
            <div className="flex justify-between items-center border-b pb-2 mb-4"><h3 className="text-xl font-semibold text-gray-700">Appointment History</h3></div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {patientAppointments.map(app => (
                <div key={app.rowIndex} className="p-3 bg-gray-50 rounded-md">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {authStatus === 'success' && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6" role="alert">
          <p className="font-bold">Success!</p>
          <p>Your Google Drive has been connected successfully. File uploads are now enabled.</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-sky-800">Admin Dashboard</h1>
        {user && <div className="flex items-center space-x-4"><span className="text-sm text-gray-500">Logged in as: {user.email} ({user.role})</span><button onClick={() => { logAction('User Logout', `User ${user.email} logged out.`); sessionStorage.removeItem('healthwiseUser'); setUser(null); }} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Log Out</button></div>}
      </div>
      <div className="border-b border-gray-200"><nav className="-mb-px flex space-x-8">
        <button onClick={() => setActiveTab('appointments')} className={`${activeTab === 'appointments' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'} py-4 px-1 border-b-2`}>Appointments</button>
        <button onClick={() => setActiveTab('patients')} className={`${activeTab === 'patients' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'} py-4 px-1 border-b-2`}>Patients</button>
        {/* The Audit Log tab is only rendered if the user is an Admin */}
        {user?.role === 'Admin' && (
            <button onClick={() => setActiveTab('audit-log')} className={`${activeTab === 'audit-log' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'} py-4 px-1 border-b-2`}>Audit Log</button>
        )}
        </nav></div>
      <div className="mt-8">
        {isLoading ? (<p>Loading data...</p>) : (
          <>
            {activeTab === 'appointments' && (
              <div className="overflow-x-auto"><table className="min-w-full bg-white shadow-md rounded-lg"><thead className="bg-sky-800 text-white"><tr><th className="py-3 px-4 text-left">Name</th><th className="py-3 px-4 text-left">Requested Date</th><th className="py-3 px-4 text-left">Status</th><th className="py-3 px-4 text-left">Payment Method</th><th className="py-3 px-4 text-left">Deposit Status</th><th className="py-3 px-4 text-left">Actions</th></tr></thead><tbody className="text-gray-700">{appointments.map((app) => (<tr key={app.rowIndex} className="border-b hover:bg-gray-100"><td className="py-3 px-4">{app.name}</td><td className="py-3 px-4">{app.requestedDate}</td><td className="py-3 px-4"><span className={`py-1 px-3 rounded-full text-xs ${app.status === 'Confirmed' ? 'bg-green-200 text-green-800' : app.status === 'Declined' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>{app.status}</span></td><td className="py-3 px-4">{app.paymentStatus}</td><td className="py-3 px-4">{app.paymentStatus.includes('Deposit Required') ? (<span className={`font-bold ${app.depositStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>{app.depositStatus || 'Unpaid'}</span>) : (<span className="text-gray-400">N/A</span>)}</td><td className="py-3 px-4 space-x-2"><button onClick={() => handleStatusUpdate(app.rowIndex, 'Confirmed')} className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-2 rounded">Confirm</button><button onClick={() => handleStatusUpdate(app.rowIndex, 'Declined')} className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-2 rounded">Decline</button></td></tr>))}</tbody></table></div>
            )}
            {activeTab === 'patients' && (
              <div className="overflow-x-auto"><table className="min-w-full bg-white shadow-md rounded-lg"><thead className="bg-sky-800 text-white"><tr><th className="py-3 px-4 text-left">Name</th><th className="py-3 px-4 text-left">Email</th><th className="py-3 px-4 text-left">Phone</th><th className="py-3 px-4 text-left">Address</th></tr></thead><tbody className="text-gray-700">{patients.map((patient, index) => (<tr key={index} className="border-b hover:bg-gray-100"><td className="py-3 px-4"><button onClick={() => setSelectedPatient(patient)} className="text-teal-600 hover:underline font-semibold">{patient.name}</button></td><td className="py-3 px-4">{patient.email}</td><td className="py-3 px-4">{patient.phone}</td><td className="py-3 px-4">{patient.address}</td></tr>))}</tbody></table></div>
            )}
            {activeTab === 'audit-log' && user?.role === 'Admin' && (
              <div className="overflow-x-auto"><table className="min-w-full bg-white shadow-md rounded-lg"><thead className="bg-sky-800 text-white"><tr><th className="py-3 px-4 text-left">Timestamp</th><th className="py-3 px-4 text-left">User</th><th className="py-3 px-4 text-left">Action</th><th className="py-3 px-4 text-left">Details</th></tr></thead><tbody className="text-gray-700">{auditLog.map((log, index) => (<tr key={index} className="border-b hover:bg-gray-100"><td className="py-3 px-4 text-sm">{log.timestamp}</td><td className="py-3 px-4 text-sm">{log.userEmail}</td><td className="py-3 px-4 text-sm font-semibold">{log.action}</td><td className="py-3 px-4 text-sm">{log.details}</td></tr>))}</tbody></table></div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// This wrapper is needed to use `useSearchParams` in a client component
export default function AdminPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}
