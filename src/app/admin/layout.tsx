"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/patients", label: "Patients" },
  { href: "/admin/phlebotomists", label: "Phlebotomists" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/audit-logs", label: "Audit Logs" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:space-x-8">
            {tabs.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block py-3 px-4 text-center sm:text-left font-semibold cursor-pointer
                    ${
                      isActive
                        ? "border-b-4 border-indigo-600 text-indigo-700"
                        : "text-gray-600 hover:text-indigo-600 hover:border-b-4 hover:border-indigo-400"
                    }
                    transition-colors duration-200`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-full p-6">{children}</main>
    </div>
  );
}
