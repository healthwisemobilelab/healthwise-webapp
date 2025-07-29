// src/components/PhlebotomistReportForm.tsx
'use client';

import React, { useState, useEffect } from 'react';

// Define the structure of our report data
export type ReportData = {
  dateTransported: string;
  timeTransported: string;
  orderingPhysician: string;
  physicianAddress: string;
  receivedBy: string;
  notes: string;
  specimenTypes: { [key: string]: boolean };
  transportedTo: { [key: string]: boolean };
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactHomePhone: string;
  emergencyContactMobile: string;
  reportStatus: 'Pending' | 'Completed';
  phlebotomistSignature: string; // New signature field
};

// Define the props the component will accept
type PhlebotomistReportFormProps = {
  initialData: string;
  onSave: (data: ReportData) => void;
  onExport: (data: ReportData) => void; // New export function prop
  isSaving: boolean;
};

// Initial state for a new, blank form
const blankReport: ReportData = {
  dateTransported: '', timeTransported: '', orderingPhysician: '', physicianAddress: '',
  receivedBy: '', notes: '',
  specimenTypes: {
    Blood: false, 'Pap Smear': false, Saliva: false, 'Sputum/Mucus': false, Stool: false, 'Swab (Nasal)': false,
    'Swab (Throat)': false, 'Swab (Vaginal)': false, Tissue: false, Urine: false,
  },
  transportedTo: {
    Biotech: false, BML: false, CHL: false, DHS: false, FMC: false, KELSO: false,
    'NEO CYT LAB': false, OAKTREE: false, PMH: false, PREMIER: false,
  },
  emergencyContactName: '', emergencyContactRelationship: '', emergencyContactHomePhone: '', emergencyContactMobile: '',
  reportStatus: 'Pending',
  phlebotomistSignature: '',
};

export default function PhlebotomistReportForm({ initialData, onSave, onExport, isSaving }: PhlebotomistReportFormProps) {
  const [reportData, setReportData] = useState<ReportData>(blankReport);

  useEffect(() => {
    try {
      const parsedData = JSON.parse(initialData);
      if (parsedData && typeof parsedData === 'object' && parsedData.specimenTypes) {
        setReportData({ ...blankReport, ...parsedData });
      } else {
        setReportData({ ...blankReport, notes: initialData });
      }
    } catch (e) {
      setReportData({ ...blankReport, notes: initialData });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReportData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (category: 'specimenTypes' | 'transportedTo', key: string) => {
    setReportData(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: !prev[category][key] },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Form fields */}
      <div><label className="block font-semibold text-gray-600 mb-1">Specimen Type Collected</label><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">{Object.keys(reportData.specimenTypes).map(key => (<label key={key} className="flex items-center space-x-2"><input type="checkbox" checked={reportData.specimenTypes[key]} onChange={() => handleCheckboxChange('specimenTypes', key)} /><span>{key}</span></label>))}</div></div>
      <div><label className="block font-semibold text-gray-600 mb-1">Specimen Transported To</label><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">{Object.keys(reportData.transportedTo).map(key => (<label key={key} className="flex items-center space-x-2"><input type="checkbox" checked={reportData.transportedTo[key]} onChange={() => handleCheckboxChange('transportedTo', key)} /><span>{key}</span></label>))}</div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input type="text" name="orderingPhysician" placeholder="Ordering Physician" value={reportData.orderingPhysician} onChange={handleInputChange} className="w-full p-2 border rounded-md" /><input type="text" name="physicianAddress" placeholder="Physician Address" value={reportData.physicianAddress} onChange={handleInputChange} className="w-full p-2 border rounded-md" /><input type="date" name="dateTransported" value={reportData.dateTransported} onChange={handleInputChange} className="w-full p-2 border rounded-md" /><input type="time" name="timeTransported" value={reportData.timeTransported} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></div>
      <input type="text" name="receivedBy" placeholder="Received By" value={reportData.receivedBy} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
      <div><label className="block font-semibold text-gray-600 mb-1">Notes</label><textarea name="notes" placeholder="e.g., Patient was dehydrated. Samples collected..." value={reportData.notes} onChange={handleInputChange} className="w-full p-2 border rounded-md" rows={4} /></div>
      <div className="border-t pt-6"><h4 className="text-lg font-semibold text-gray-700 mb-2">Emergency Contact Details</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input type="text" name="emergencyContactName" placeholder="Contact Name" value={reportData.emergencyContactName} onChange={handleInputChange} className="w-full p-2 border rounded-md" /><input type="text" name="emergencyContactRelationship" placeholder="Relationship" value={reportData.emergencyContactRelationship} onChange={handleInputChange} className="w-full p-2 border rounded-md" /><input type="tel" name="emergencyContactHomePhone" placeholder="Home Number" value={reportData.emergencyContactHomePhone} onChange={handleInputChange} className="w-full p-2 border rounded-md" /><input type="tel" name="emergencyContactMobile" placeholder="Mobile Number" value={reportData.emergencyContactMobile} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></div></div>
      
      {/* Signature Field */}
      <div className="border-t pt-6">
        <label className="block font-semibold text-gray-600 mb-1">Phlebotomist Signature</label>
        <input type="text" name="phlebotomistSignature" placeholder="Type your full name to sign" value={reportData.phlebotomistSignature} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
      </div>

      {/* Status and Action Buttons */}
      <div className="flex justify-between items-center border-t pt-6">
        <div>
          <label className="block font-semibold text-gray-600 mb-1">Report Status</label>
          <select name="reportStatus" value={reportData.reportStatus} onChange={handleInputChange} className="p-2 border rounded-md">
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="flex space-x-4">
          <button onClick={() => onExport(reportData)} type="button" className="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg shadow-lg hover:bg-gray-600">
            Export Report
          </button>
          <button onClick={() => onSave(reportData)} disabled={isSaving} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-700 disabled:bg-gray-400">
            {isSaving ? 'Saving...' : 'Save Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
