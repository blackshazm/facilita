'use client';

import React, { useState } from 'react';

const INITIAL_PROVIDERS = [
  { id: '1', name: 'João Silva', tier: 'BRONZE', services: 45, rating: 4.6, status: 'Active' },
  { id: '2', name: 'Maria Santos', tier: 'PRATA', services: 88, rating: 4.9, status: 'Active' },
  { id: '3', name: 'Carlos Souza', tier: 'BRONZE', services: 5, rating: 4.2, status: 'Flagged' },
];

export default function TiersPage() {
  const [providers, setProviders] = useState(INITIAL_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [newTier, setNewTier] = useState('');

  const handleOverride = (provider: any) => {
    setSelectedProvider(provider);
    setNewTier(provider.tier);
  };

  const confirmOverride = () => {
    console.log(`Overriding tier for ${selectedProvider.name} to ${newTier}. Reason: ${overrideReason}`);
    setProviders(prev => prev.map(p => 
      p.id === selectedProvider.id ? { ...p, tier: newTier } : p
    ));
    setSelectedProvider(null);
    setOverrideReason('');
    alert('Tier overridden successfully. Audit log created.');
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tier Management</h1>
        <p className="text-slate-500">Review and manual override of provider performance tiers</p>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-700">Provider</th>
              <th className="p-4 font-semibold text-slate-700">Current Tier</th>
              <th className="p-4 font-semibold text-slate-700">Services</th>
              <th className="p-4 font-semibold text-slate-700">Rating</th>
              <th className="p-4 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {providers.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-medium text-slate-900">{p.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    p.tier === 'OURO' ? 'bg-yellow-100 text-yellow-700' : 
                    p.tier === 'PRATA' ? 'bg-slate-200 text-slate-700' : 
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {p.tier}
                  </span>
                </td>
                <td className="p-4 text-slate-600 text-sm">{p.services}</td>
                <td className="p-4 text-slate-600 text-sm">⭐ {p.rating}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleOverride(p)}
                    className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded border border-emerald-200 hover:bg-emerald-100 transition text-sm font-semibold"
                  >
                    Manual Override
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Override Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Manual Tier Override</h2>
            <p className="text-sm text-slate-600 mb-4">
              You are overriding the tier for <strong>{selectedProvider.name}</strong>. This action will be logged in the audit trail.
            </p>
            
            <label className="block text-sm font-medium text-slate-700 mb-1">New Tier</label>
            <select 
              className="w-full p-2 border border-slate-200 rounded-lg mb-4 bg-slate-50"
              value={newTier}
              onChange={(e) => setNewTier(e.target.value)}
            >
              <option value="BRONZE">BRONZE (Default)</option>
              <option value="PRATA">PRATA (Premium)</option>
              <option value="OURO">OURO (Elite)</option>
            </select>

            <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Override</label>
            <textarea 
              className="w-full p-2 border border-slate-200 rounded-lg mb-6 bg-slate-50 h-24"
              placeholder="Explain why this manual change is necessary..."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
            ></textarea>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedProvider(null)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={confirmOverride}
                disabled={!overrideReason}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50"
              >
                Confirm Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
