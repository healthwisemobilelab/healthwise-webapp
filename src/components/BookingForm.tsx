// src/components/BookingForm.tsx
'use client';

import { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaUser, FaCalendarAlt, FaFileContract, FaCreditCard, FaUpload } from 'react-icons/fa';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import type { OnApproveData, OnApproveActions, CreateOrderData, CreateOrderActions } from "@paypal/paypal-js";

type BookingFormProps = {
  onClose: () => void;
  setBookingMessage: (message: string) => void;
};

// --- FIX: Updated the services list to match the services page ---
const servicesWithPrices: { [key: string]: number } = {
  'Routine Annual Blood Draw': 75, 
  'Full Blood Test Panels': 150, 
  'Prenatal Lab Testing': 120,
  'Cholesterol Testing': 60, 
  'ECG': 100, 
  'HCG & Pregnancy Testing': 50, 
  'Blood Pressure Check': 25,
  'Blood Glucose Test': 25, 
  'Blood Type Test': 40, 
  'COVID Testing': 80, 
  'HIV Testing': 90,
  'STD Screening': 110, 
  'Drug Testing': 180, 
  'Food Allergy Testing': 180, 
  'Other': 0,
};

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
];

export default function BookingForm({ onClose, setBookingMessage }: BookingFormProps) {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: '', dateOfBirth: '',
    nationalInsurance: '', maritalStatus: 'Single', occupation: '',
    service: '', specialInstructions: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [requisitionFile, setRequisitionFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedServicePrice = useMemo(() => servicesWithPrices[formData.service] || 0, [formData.service]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRequisitionFile(e.target.files[0]);
    }
  };

  const saveAppointmentAndSendEmail = async (paymentStatus: string, paymentDetails?: any) => {
    const formattedDate = selectedDate!.toLocaleDateString('en-US', { dateStyle: 'long' });
    const requestedDate = `${formattedDate} at ${selectedTime}`;
    const submissionData = { ...formData, requestedDate, paymentStatus, paymentDetails };

    try {
      const submitResponse = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      if (!submitResponse.ok) throw new Error('Failed to save appointment details.');
      const submitResult = await submitResponse.json();
      const newRowIndex = submitResult.rowIndex;

      if (requisitionFile && newRowIndex) {
        const fileFormData = new FormData();
        fileFormData.append('requisitionFile', requisitionFile);
        fileFormData.append('rowIndex', newRowIndex.toString());
        await fetch('/api/upload-requisition', {
          method: 'POST',
          body: fileFormData,
        });
      }
      
      // After saving, send the new confirmation email
      await fetch('/api/send-booking-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            patientEmail: formData.email, 
            patientName: formData.name,
            service: formData.service,
            requestedDate: requestedDate,
            paymentStatus: paymentStatus
        }),
      });

      return true;
    } catch (error) {
      console.error("Error in save/email process:", error);
      return false;
    }
  };

  const handlePayInPerson = async () => {
      if (!formData.name || !selectedDate || !selectedTime) {
        setFormError('Please fill out all patient and appointment details before submitting.');
        return;
      }
      setIsLoading(true);
      const success = await saveAppointmentAndSendEmail('Deposit Required (Pay In Person)');
      if (success) {
        setBookingMessage('✅ Your request is submitted! Please check your email for details and deposit instructions.');
        setTimeout(onClose, 6000);
      } else {
        setFormError('There was an issue saving your appointment. Please try again.');
      }
      setIsLoading(false);
  };

  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '' }}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 overflow-y-auto">
        <div className="bg-white my-8 p-8 rounded-lg shadow-2xl w-full max-w-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
          <h2 className="text-3xl font-bold mb-2 text-gray-800">Schedule Your Appointment</h2>
          <p className="text-gray-500 mb-8">Fill out the form below to request an appointment.</p>
          
          <div className="space-y-8">
            <section>
              <h3 className="text-xl font-semibold text-teal-700 flex items-center mb-4"><FaUser className="mr-3" /> Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required className="w-full p-3 border rounded-md" />
                <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} required className="w-full p-3 border rounded-md" />
                <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required className="w-full p-3 border rounded-md" />
                <input type="text" name="address" placeholder="Patient Location (Address)" onChange={handleChange} required className="w-full p-3 border rounded-md" />
                <input type="text" name="dateOfBirth" placeholder="Date of Birth (MM/DD/YYYY)" onFocus={(e) => e.target.type = 'date'} onBlur={(e) => e.target.type = 'text'} onChange={handleChange} required className="w-full p-3 border rounded-md" />
                <input type="text" name="nationalInsurance" placeholder="National Insurance Number" onChange={handleChange} required className="w-full p-3 border rounded-md" />
                <select name="maritalStatus" onChange={handleChange} value={formData.maritalStatus} className="w-full p-3 border rounded-md"><option>Single</option><option>Married</option><option>Other</option></select>
                <input type="text" name="occupation" placeholder="Occupation" onChange={handleChange} required className="w-full p-3 border rounded-md" />
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-teal-700 flex items-center mb-4"><FaCalendarAlt className="mr-3" /> Appointment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select name="service" onChange={handleChange} value={formData.service} required className="w-full p-3 border rounded-md">
                  <option value="">-- Select a service --</option>
                  {Object.keys(servicesWithPrices).map(service => (<option key={service} value={service}>{service}</option>))}
                </select>
                <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} minDate={new Date()} placeholderText="Pick a date" required className="w-full p-3 border rounded-md" />
              </div>
              <div className="mt-4"><label className="block text-gray-700 font-semibold mb-2">Preferred Time Slot</label><div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">{timeSlots.map(time => (<button key={time} type="button" onClick={() => setSelectedTime(time)} className={`p-2 rounded-md text-center text-sm font-semibold border ${selectedTime === time ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>{time}</button>))}</div></div>
              <div className="mt-4"><textarea name="specialInstructions" rows={3} placeholder="e.g., Specific entry instructions, allergies, accessibility needs." onChange={handleChange} className="w-full p-3 border rounded-md" /></div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-teal-700 flex items-center mb-4"><FaUpload className="mr-3" /> Upload Requisition Form (Optional)</h3>
              <div className="mt-2 flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-teal-300 border-dashed rounded-lg cursor-pointer bg-teal-50 hover:bg-teal-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FaUpload className="w-8 h-8 mb-3 text-teal-500" />
                          {requisitionFile ? (<p className="font-semibold text-teal-800">{requisitionFile.name}</p>) : (<><p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p><p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 5MB)</p></>)}
                      </div>
                      <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
                  </label>
              </div> 
            </section>

            <section>
              <h3 className="text-xl font-semibold text-teal-700 flex items-center mb-4"><FaFileContract className="mr-3" /> Digital Consent Forms</h3>
              <div className="space-y-3 text-sm text-gray-600"><label className="flex items-center"><input type="checkbox" required className="mr-2 h-4 w-4" /> I consent to treatment and associated medical procedures.</label><label className="flex items-center"><input type="checkbox" required className="mr-2 h-4 w-4" /> I acknowledge receipt of the HIPAA Notice of Privacy Practices.</label><label className="flex items-center"><input type="checkbox" required className="mr-2 h-4 w-4" /> I understand and accept the financial responsibility policy.</label></div>
              <a href="/consent" target="_blank" className="text-teal-600 hover:underline text-sm mt-2 inline-block">View Full Forms</a>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-teal-700 flex items-center mb-4"><FaCreditCard className="mr-3" /> Payment</h3>
              {formData.service ? (
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <p className="text-gray-600">Total Service Cost:</p>
                  <p className="text-3xl font-bold text-gray-800">${selectedServicePrice.toFixed(2)}</p>
                </div>
              ) : (
                <p className="text-gray-500">Please select a service to view the price.</p>
              )}
              
              {formError && <p className="text-red-500 text-center mt-4">{formError}</p>}

              <div className="mt-6">
                <p className="text-center text-sm text-gray-500 mb-2">Pay securely online:</p>
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  disabled={!formData.service || !selectedDate || !selectedTime}
                  createOrder={async (data: CreateOrderData, actions: CreateOrderActions) => {
                    setFormError('');
                    if (!formData.name || !selectedDate || !selectedTime) {
                      setFormError('Please fill out all patient and appointment details before proceeding to payment.');
                      return '';
                    }
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [{
                        description: `Payment for ${formData.service}`,
                        amount: {
                          currency_code: "USD",
                          value: selectedServicePrice.toFixed(2),
                        },
                      }],
                      application_context: {
                        shipping_preference: 'NO_SHIPPING'
                      }
                    });
                  }}
                  onApprove={async (data: OnApproveData, actions: OnApproveActions) => {
                    const order = await actions.order?.capture();
                    if (order) {
                      const success = await saveAppointmentAndSendEmail('Paid Online via PayPal', order);
                      if (success) {
                        setBookingMessage('✅ Success! Your appointment is confirmed. Please check your email.');
                        setTimeout(onClose, 4000);
                      } else {
                        setFormError('There was an issue saving your appointment after payment. Please contact us.');
                      }
                    }
                  }}
                  onError={(err) => {
                    console.error("PayPal Error:", err);
                    setFormError("An error occurred with the payment. Please try again.");
                  }}
                />
                <p className="text-center text-sm text-gray-500 my-4">OR</p>
                <button 
                    type="button" 
                    onClick={handlePayInPerson} 
                    disabled={isLoading || !formData.service || !selectedDate || !selectedTime}
                    className="w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg shadow-lg hover:bg-gray-700 disabled:bg-gray-300"
                >
                    {isLoading ? 'Submitting...' : 'Request to Pay In Person (Deposit Required)'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
