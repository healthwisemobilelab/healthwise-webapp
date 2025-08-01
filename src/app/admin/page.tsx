// src/app/admin/page.tsx
'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-7xl mx-auto">
        <TabsList className="grid grid-cols-4 gap-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="phlebotomists">Phlebotomists</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="mt-6 bg-white p-6 rounded shadow">📊 Dashboard overview goes here.</div>
        </TabsContent>

        <TabsContent value="appointments">
          <div className="mt-6 bg-white p-6 rounded shadow">📅 Appointments table goes here.</div>
        </TabsContent>

        <TabsContent value="patients">
          <div className="mt-6 bg-white p-6 rounded shadow">👨‍⚕️ Patient records go here.</div>
        </TabsContent>

        <TabsContent value="phlebotomists">
          <div className="mt-6 bg-white p-6 rounded shadow">🧪 Phlebotomist uploads/forms go here.</div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
