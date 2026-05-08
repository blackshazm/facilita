import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">
        <div className="text-2xl font-bold mb-10 text-emerald-400">FACILITA Admin</div>
        <nav className="flex-1 space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 transition">
            🛡️ Fraud Monitor
          </Link>
          <Link href="/admin/tiers" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
            🏆 Provider Tiers
          </Link>
          <Link href="/admin/payouts" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
            💰 Payouts
          </Link>
          <Link href="/admin/audit" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
            📋 Audit Log
          </Link>
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-800 text-slate-400 text-sm">
          v1.0.0-alpha
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
