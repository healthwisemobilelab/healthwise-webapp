// src/app/about/page.tsx
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center text-healthwise-teal mb-10">About Health Wise Mobile Phlebotomy</h1> {/* Using custom teal */}

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Founded in Nassau, Bahamas, Health Wise Mobile Phlebotomy & Lab Services was created with one simple mission: to make essential lab testing
          convenient, comfortable, and accessible for everyone in New Providence. We understand that traditional lab visits can be time-consuming,
          stressful, and often inconvenient. That's why we bring the lab to you.
        </p>

        <h2 className="text-3xl font-semibold text-healthwise-teal mb-4">Our Commitment</h2> {/* Using custom teal */}
        <ul className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-6 space-y-2">
          <li>
            <strong>Convenience:</strong> Schedule appointments at your preferred time and location – whether it's your home, office, or
            another private setting. We eliminate the need for travel and waiting rooms.
          </li>
          <li>
            <strong>Professionalism:</strong> Our team consists of highly trained, certified, and compassionate phlebotomists dedicated to
            providing the highest standard of care with every collection.
          </li>
          <li>
            <strong>Privacy:</strong> Your health is personal. We ensure complete discretion and a comfortable experience in a familiar
            environment, respecting your privacy every step of the way.
          </li>
          <li>
            <strong>Accuracy:</strong> We adhere to stringent safety and handling protocols to ensure the integrity and accuracy of your
            samples for reliable lab results.
          </li>
        </ul>

        <h2 className="text-3xl font-semibold text-healthwise-teal mb-4">Who We Serve</h2> {/* Using custom teal */}
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          We cater to individuals who prioritize convenience and privacy, those with busy schedules, limited mobility, or simply anyone who
           prefers the comfort of receiving healthcare services at their doorstep. We work with various local laboratories to ensure your samples
          are processed efficiently.
        </p>

        <div className="text-center mt-8">
          <p className="text-xl font-medium text-gray-800 mb-4">
            "We are dedicated to bringing health and wellness directly to you."
          </p>
          <Link
            href="/book"
            className="inline-block px-8 py-4 bg-healthwise-yellow text-healthwise-teal font-bold text-lg rounded-full shadow-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105" // Using custom yellow & teal
          >
            Book Your Appointment Today
          </Link>
        </div>
      </div>
    </div>
  );
}