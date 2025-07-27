// src/app/contact/page.tsx
import React from 'react';
import { FaEnvelope, FaPhone, FaClock, FaInstagram, FaFacebook } from 'react-icons/fa';

export default function ContactPage() {
  return (
    <div className="bg-white py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-teal-700">
            Get In Touch
          </h1>
          <p className="mt-4 text-lg text-gray-600 font-sans max-w-xl mx-auto">
            We're here to help with any questions you may have. Please don't hesitate to reach out to us during our business hours.
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {/* Email Card */}
          <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg shadow-sm">
            <FaEnvelope className="text-3xl text-teal-600 mt-1" />
            <div>
              <h2 className="text-2xl font-serif font-semibold text-gray-800">Email Us</h2>
              <p className="mt-1 text-gray-600 font-sans">For general inquiries, scheduling, and support.</p>
              <a href="mailto:info.healthwisemobilelab@gmail.com" className="text-lg text-teal-700 hover:text-yellow-500 font-sans font-bold mt-2 inline-block break-all">
                info.healthwisemobilelab@gmail.com
              </a>
            </div>
          </div>

          {/* Phone Card */}
          <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg shadow-sm">
            <FaPhone className="text-3xl text-teal-600 mt-1" />
            <div>
              <h2 className="text-2xl font-serif font-semibold text-gray-800">Call Us</h2>
              <p className="mt-1 text-gray-600 font-sans">Speak with a member of our team directly.</p>
              <a href="tel:+12428079473" className="text-lg text-teal-700 hover:text-yellow-500 font-sans font-bold mt-2 inline-block">
                (242) 807-WISE (9473)
              </a>
            </div>
          </div>

          {/* Facebook Card */}
          <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg shadow-sm">
            <FaFacebook className="text-3xl text-teal-600 mt-1" />
            <div>
              <h2 className="text-2xl font-serif font-semibold text-gray-800">Find us on Facebook</h2>
              <p className="mt-1 text-gray-600 font-sans">Connect with us on social media.</p>
              <a href="https://www.facebook.com/healthwisemobilelab" target="_blank" rel="noopener noreferrer" className="text-lg text-teal-700 hover:text-yellow-500 font-sans font-bold mt-2 inline-block">
                @healthwisemobilelab
              </a>
            </div>
          </div>

          {/* Instagram Card */}
          <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg shadow-sm">
            <FaInstagram className="text-3xl text-teal-600 mt-1" />
            <div>
              <h2 className="text-2xl font-serif font-semibold text-gray-800">Follow Us on Instagram</h2>
              <p className="mt-1 text-gray-600 font-sans">Stay up to date with our latest news and offers.</p>
              <a href="https://www.instagram.com/healthwisemobilelab" target="_blank" rel="noopener noreferrer" className="text-lg text-teal-700 hover:text-yellow-500 font-sans font-bold mt-2 inline-block">
                @healthwisemobilelab
              </a>
            </div>
          </div>

          {/* Business Hours Card */}
          <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg shadow-sm">
            <FaClock className="text-3xl text-teal-600 mt-1" />
            <div>
              <h2 className="text-2xl font-serif font-semibold text-gray-800">Business Hours</h2>
              <div className="mt-2 text-gray-700 font-sans space-y-1">
                <p><strong>Monday - Friday:</strong> 8:00 AM – 5:00 PM</p>
                <p><strong>Saturday:</strong> 9:00 AM – 1:00 PM</p>
                <p><strong>Sunday & Holidays:</strong> Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
