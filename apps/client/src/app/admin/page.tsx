'use client';

import React, { useState } from 'react';

const MOCK_ALERTS = [
  { id: '1', provider: 'João Silva', reason: 'VELOCITY_LIMIT_EXCEEDED', date: '2026-05-03', severity: 'High', status: 'Flagged' },
  { id: '2', provider: 'Maria Santos', reason: 'GEOFENCE_VIOLATION', date: '2026-05-03', severity: 'Medium', status: 'Reviewing' },
  { id: '3', provider: 'Carlos Souza', reason: 'MULTIPLE_FAILED_EVIDENCE', date: '2026-05-02', severity: 'High', status: 'Blocked' },
];

export default function AdminPage() {
  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Fraud Monitor</h1>
          <p className="text-slate-500">Real-time alerts and provider risk management</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
            <span className="text-slate-400 text-sm">Active Alerts:</span>
            <span className="ml-2 font-bold text-rose-600">12</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
            <span className="text-slate-400 text-sm">Pending Review:</span>
            <span className="ml-2 font-bold text-amber-500">5</span>
          </div>
        </div>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-700">Provider</th>
              <th className="p-4 font-semibold text-slate-700">Reason</th>
              <th className="p-4 font-semibold text-slate-700">Date</th>
              <th className="p-4 font-semibold text-slate-700">Severity</th>
              <th className="p-4 font-semibold text-slate-700">Status</th>
              <th className="p-4 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_ALERTS.map((alert) => (
              <tr key={alert.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-medium text-slate-900">{alert.provider}</td>
                <td className="p-4 text-slate-600">
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">{alert.reason}</span>
                </td>
                <td className="p-4 text-slate-500 text-sm">{alert.date}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    alert.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {alert.severity}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`flex items-center gap-2 text-sm ${
                    alert.status === 'Flagged' ? 'text-rose-600' : 'text-slate-600'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${
                      alert.status === 'Flagged' ? 'bg-rose-600' : 'bg-slate-400'
                    }`}></span>
                    {alert.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm">Review Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
