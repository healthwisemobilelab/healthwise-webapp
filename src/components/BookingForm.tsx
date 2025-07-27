// src/components/BookingForm.tsx
'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaUser, FaCalendarAlt, FaFileContract } from 'react-icons/fa';

type BookingFormProps = {
  onClose: () => void;
  setBookingMessage: (message: string) => void;
};

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
];

export default function BookingForm({ onClose, setBookingMessage }: BookingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    service: '',
    specialInstructions: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and a time slot.');
      return;
    }
    setIsLoading(true);
    setBookingMessage('');

    const formattedDate = selectedDate.toLocaleDateString('en-US', { dateStyle: 'long' });
    const requestedDate = `${formattedDate} at ${selectedTime}`;

    const submissionData = { ...formData, requestedDate };

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        setBookingMessage('✅ Success! Your appointment request has been sent.');
        setTimeout(onClose, 2000);
      } else {
        const data = await response.json();
        setBookingMessage(`❌ Error: Could not submit request. Please try again.`);
        console.error('API Error:', data.error);
      }
    } catch (error) {
      setBookingMessage('❌ Network error. Could not connect to the API.');
      console.error('Network Error:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 overflow-y-auto">
      <div className="bg-white my-8 p-8 rounded-lg shadow-2xl w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        
        <h2 className="text-3xl font-bold mb-2 text-gray-800">Schedule Your Appointment</h2>
        <p className="text-gray-500 mb-8">Fill out the form below to request an appointment. All fields are required.</p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold text-teal-700 flex items-center mb-4"><FaUser className="mr-3" /> Patient Information</h3>
            <div className="space-y-4">
              <input type="text" name="name" placeholder="e.g., Jane Doe" onChange={handleChange} required className="w-full p-3 border rounded-md" />
              <input type="tel" name="phone" placeholder="(123) 456-7890" onChange={handleChange} required className="w-full p-3 border rounded-md" />
              <input type="email" name="email" placeholder="jane.doe@example.com" onChange={handleChange} required className="w-full p-3 border rounded-md" />
              <input type="text" name="address" placeholder="123 Health St, Wellness City, 12345" onChange={handleChange} required className="w-full p-3 border rounded-md" />
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-teal-700 flex items-center mb-4"><FaCalendarAlt className="mr-3" /> Appointment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="service" onChange={handleChange} required className="w-full p-3 border rounded-md">
                <option value="">-- Select a service --</option>
                <option>Routine Annual Blood Draw</option>
                <option>Vital Signs (BP, Glucose, Blood Type)</option>
                <option>Prenatal Lab Testing</option>
                <option>Full Blood Test Panels</option>
                <option>Cholesterol Testing</option>
                <option>ECG</option>
                <option>COVID, HIV & STD Screening</option>
                <option>HCG & Pregnancy Testing</option>
                <option>Drug & Food Allergy Sensitivity Testing</option>
                <option>Other</option>
              </select>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                minDate={new Date()}
                placeholderText="Pick a date"
                required
                className="w-full p-3 border rounded-md"
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-700 font-semibold mb-2">Preferred Time Slot</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 rounded-md text-center text-sm font-semibold border ${selectedTime === time ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <textarea name="specialInstructions" rows={3} placeholder="e.g., Specific entry instructions, allergies, accessibility needs." onChange={handleChange} className="w-full p-3 border rounded-md" />
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-teal-700 flex items-center mb-4"><FaFileContract className="mr-3" /> Digital Consent Forms</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <label className="flex items-center"><input type="checkbox" required className="mr-2 h-4 w-4" /> I consent to treatment and associated medical procedures.</label>
              <label className="flex items-center"><input type="checkbox" required className="mr-2 h-4 w-4" /> I acknowledge receipt of the HIPAA Notice of Privacy Practices.</label>
              <label className="flex items-center"><input type="checkbox" required className="mr-2 h-4 w-4" /> I understand and accept the financial responsibility policy.</label>
            </div>
            <a href="/consent" target="_blank" className="text-teal-600 hover:underline text-sm mt-2 inline-block">View Full Forms</a>
          </section>

          <div className="text-right">
            <button type="submit" disabled={isLoading} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-700 disabled:bg-gray-400">
              {isLoading ? 'Submitting...' : 'Submit Appointment Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
