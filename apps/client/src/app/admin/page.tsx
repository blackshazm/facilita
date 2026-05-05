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
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2 tracking-widest uppercase text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Operations
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight leading-none">Painel de Gestão</h1>
            <p className="text-slate-400 mt-4 text-xl max-w-xl">Milestone 6.0 — Infraestrutura Analítica & BI operacional de alta fidelidade.</p>
          </div>
          <button 
            onClick={handleExport}
            className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-2xl font-black shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 hover:-translate-y-1"
          >
            <Download size={24} className="group-hover:bounce" />
            EXPORTAR BI (CSV)
          </button>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 flex items-center gap-6 hover:border-emerald-500/50 transition-colors group">
            <div className="bg-emerald-500/10 p-5 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
              <TrendingUp size={32} />
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">GMV Total (7d)</p>
              <p className="text-4xl font-black text-white">R$ 4.310,00</p>
            </div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 flex items-center gap-6 hover:border-blue-500/50 transition-colors group">
            <div className="bg-blue-500/10 p-5 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
              <ShoppingBag size={32} />
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">Ordens Realizadas</p>
              <p className="text-4xl font-black text-white">427</p>
            </div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 flex items-center gap-6 hover:border-purple-500/50 transition-colors group">
            <div className="bg-purple-500/10 p-5 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">Taxa de Match</p>
              <p className="text-4xl font-black text-white">84%</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white">Fluxo Financeiro</h2>
              <span className="text-emerald-400 text-sm font-black bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">+12% vs last week</span>
            </div>
            <div className="min-h-[300px]">
              <MetricsChart data={metrics} type="gmv" />
            </div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white">Demanda Operacional</h2>
              <span className="text-blue-400 text-sm font-black bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full">Volume Estável</span>
            </div>
            <div className="min-h-[300px]">
              <MetricsChart data={metrics} type="orders" />
            </div>
          </div>
        </div>

        {/* Fraud Monitor Section */}
        <section className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 overflow-hidden">
          <div className="p-10 border-b border-slate-800 flex items-center gap-4">
            <div className="bg-rose-500/10 p-3 rounded-2xl text-rose-500">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Audit Log & Segurança</h2>
              <p className="text-slate-500 text-sm mt-1">Monitoramento de risco em tempo real via GSD-Engine.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/30">
                  <th className="px-10 py-6 font-black text-slate-500 text-xs uppercase tracking-widest">Provedor</th>
                  <th className="px-10 py-6 font-black text-slate-500 text-xs uppercase tracking-widest">Motivo</th>
                  <th className="px-10 py-6 font-black text-slate-500 text-xs uppercase tracking-widest">Data</th>
                  <th className="px-10 py-6 font-black text-slate-500 text-xs uppercase tracking-widest">Severidade</th>
                  <th className="px-10 py-6 font-black text-slate-500 text-xs uppercase tracking-widest">Status</th>
                  <th className="px-10 py-6 font-black text-slate-500 text-xs uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {MOCK_ALERTS.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-10 py-7 font-black text-white text-lg">{alert.provider}</td>
                    <td className="px-10 py-7">
                      <span className="bg-slate-800 text-emerald-400/80 px-4 py-1.5 rounded-xl text-xs font-black font-mono border border-slate-700">{alert.reason}</span>
                    </td>
                    <td className="px-10 py-7 text-slate-400 font-medium">{alert.date}</td>
                    <td className="px-10 py-7">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        alert.severity === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <span className={`flex items-center gap-3 font-black text-xs uppercase tracking-widest ${
                        alert.status === 'Flagged' ? 'text-rose-500' : 'text-slate-400'
                      }`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          alert.status === 'Flagged' ? 'bg-rose-500 shadow-lg shadow-rose-500/50 animate-pulse' : 'bg-slate-600'
                        }`}></span>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <button className="bg-white text-slate-950 px-6 py-2.5 rounded-xl font-black text-xs hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/20">DETALHES</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
