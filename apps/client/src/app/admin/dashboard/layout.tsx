import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight text-emerald-700">Operational Dashboard</h1>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
