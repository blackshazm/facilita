'use client';

import React, { useState, useEffect } from 'react';
import { MetricsChart } from './components/metrics-chart';
import { Download, TrendingUp, ShoppingBag, Users, ShieldAlert } from 'lucide-react';

const MOCK_ALERTS = [
  { id: '1', provider: 'João Silva', reason: 'VELOCITY_LIMIT_EXCEEDED', date: '2026-05-03', severity: 'High', status: 'Flagged' },
  { id: '2', provider: 'Maria Santos', reason: 'GEOFENCE_VIOLATION', date: '2026-05-03', severity: 'Medium', status: 'Reviewing' },
  { id: '3', provider: 'Carlos Souza', reason: 'MULTIPLE_FAILED_EVIDENCE', date: '2026-05-02', severity: 'High', status: 'Blocked' },
];

const MOCK_METRICS = [
  { date: '2026-04-28', gmv: 450000, ordersCount: 45, matchesCount: 120, revenue: 90000 },
  { date: '2026-04-29', gmv: 520000, ordersCount: 52, matchesCount: 140, revenue: 104000 },
  { date: '2026-04-30', gmv: 480000, ordersCount: 48, matchesCount: 130, revenue: 96000 },
  { date: '2026-05-01', gmv: 610000, ordersCount: 61, matchesCount: 160, revenue: 122000 },
  { date: '2026-05-02', gmv: 750000, ordersCount: 75, matchesCount: 190, revenue: 150000 },
  { date: '2026-05-03', gmv: 680000, ordersCount: 68, matchesCount: 175, revenue: 136000 },
  { date: '2026-05-04', gmv: 820000, ordersCount: 82, matchesCount: 210, revenue: 164000 },
];

export default function AdminPage() {
  const [metrics, setMetrics] = useState(MOCK_METRICS);
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = () => {
    window.open('/api/analytics/export', '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Painel de Gestão</h1>
          <p className="text-slate-500 mt-2 text-lg">Milestone 6.0 — Growth & Compliance</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          <Download size={20} />
          Exportar Relatório CSV
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-slate-500 font-medium">GMV Total (7d)</p>
            <p className="text-3xl font-black text-slate-900">R$ 4.310,00</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
            <ShoppingBag size={28} />
          </div>
          <div>
            <p className="text-slate-500 font-medium">Ordens Realizadas</p>
            <p className="text-3xl font-black text-slate-900">427</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="bg-purple-100 p-4 rounded-xl text-purple-600">
            <Users size={28} />
          </div>
          <div>
            <p className="text-slate-500 font-medium">Taxa de Match</p>
            <p className="text-3xl font-black text-slate-900">84%</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Desempenho Financeiro (GMV)</h2>
            <span className="text-emerald-500 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-full">+12% vs last week</span>
          </div>
          <MetricsChart data={metrics} type="gmv" />
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Volume de Ordens</h2>
            <span className="text-blue-500 text-sm font-bold bg-blue-50 px-3 py-1 rounded-full">427 total</span>
          </div>
          <MetricsChart data={metrics} type="orders" />
        </div>
      </div>

      {/* Fraud Monitor Section */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-3">
          <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Monitor de Fraude & Riscos</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Provedor</th>
              <th className="px-8 py-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Motivo</th>
              <th className="px-8 py-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Data</th>
              <th className="px-8 py-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Severidade</th>
              <th className="px-8 py-4 font-bold text-slate-500 text-sm uppercase tracking-wider">Status</th>
              <th className="px-8 py-4 font-bold text-slate-500 text-sm uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_ALERTS.map((alert) => (
              <tr key={alert.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5 font-bold text-slate-900">{alert.provider}</td>
                <td className="px-8 py-5">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-tighter">{alert.reason}</span>
                </td>
                <td className="px-8 py-5 text-slate-500 font-medium">{alert.date}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    alert.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {alert.severity}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className={`flex items-center gap-2 font-bold text-sm ${
                    alert.status === 'Flagged' ? 'text-rose-600' : 'text-slate-600'
                  }`}>
                    <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${
                      alert.status === 'Flagged' ? 'bg-rose-600' : 'bg-slate-400'
                    }`}></span>
                    {alert.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-600 transition-colors">Ver Detalhes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
