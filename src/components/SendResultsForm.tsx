// src/components/SendResultsForm.tsx
'use client';

import React, { useState } from 'react';
import { FaPaperPlane, FaTimes, FaPaperclip } from 'react-icons/fa';

type Patient = {
  name: string;
  email: string;
};

type SendResultsFormProps = {
  patient: Patient;
  onClose: () => void;
};

export default function SendResultsForm({ patient, onClose }: SendResultsFormProps) {
  const [doctorEmail, setDoctorEmail] = useState('');
  const [message, setMessage] = useState(
    `Dear ${patient.name},\n\nPlease find your attached lab results from your recent visit.\n\nThank you for choosing Health Wise Mobile Phlebotomy.\n\nSincerely,\nThe Health Wise Team`
  );
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleSend = async () => {
    if (!attachedFile) {
      setStatusMessage('Error: Please attach the lab results file.');
      return;
    }
    setIsSending(true);
    setStatusMessage('Sending...');

    const formData = new FormData();
    formData.append('patientEmail', patient.email);
    formData.append('doctorEmail', doctorEmail);
    formData.append('subject', `Your Lab Results from Health Wise Mobile Phlebotomy`);
    formData.append('message', message);
    formData.append('file', attachedFile);

    try {
      const response = await fetch('/api/send-results', {
        method: 'POST',
        body: formData, // We use FormData for file uploads
      });

      if (!response.ok) {
        throw new Error('Failed to send email.');
      }

      setStatusMessage('Success! Email has been sent.');
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Email sending error:', error);
      setStatusMessage('Error: Could not send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><FaTimes /></button>
        <h2 className="text-2xl font-bold mb-6 text-sky-800">Send Lab Results to {patient.name}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600">Patient's Email (To)</label>
            <input type="email" value={patient.email} readOnly className="w-full p-2 border rounded-md bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600">Doctor's Email (Cc)</label>
            <input type="email" value={doctorEmail} onChange={(e) => setDoctorEmail(e.target.value)} placeholder="Optional: Enter doctor's email" className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600">Subject</label>
            <input type="text" value={`Your Lab Results from Health Wise Mobile Phlebotomy`} readOnly className="w-full p-2 border rounded-md bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600">Message</label>
            <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600">Attachment</label>
            <div className="mt-1 flex items-center">
              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                <FaPaperclip className="inline-block mr-2" />
                Attach Lab Results
                <input type='file' className="hidden" onChange={handleFileChange} />
              </label>
              {attachedFile && <span className="ml-3 text-sm text-gray-500">{attachedFile.name}</span>}
            </div>
          </div>
        </div>

        {statusMessage && <p className="mt-4 text-center font-semibold">{statusMessage}</p>}

        <div className="mt-8 text-right">
          <button onClick={handleSend} disabled={isSending || !attachedFile} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            <FaPaperPlane className="inline-block mr-2" />
            {isSending ? 'Sending...' : 'Send Results'}
          </button>
        </div>
      </div>
    </div>
  );
}
