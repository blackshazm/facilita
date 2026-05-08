'use client';

import React, { useEffect, useState } from 'react';
import { usePayouts } from '@/hooks/use-payouts';
import { 
  CheckCircle2, 
  XCircle, 
  History, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Wallet
} from 'lucide-react';

export default function PayoutsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [page, setPage] = useState(1);
  const { payouts, total, isLoading, fetchPayouts, approvePayout, blockPayout } = usePayouts();

  useEffect(() => {
    const status = activeTab === 'pending' ? 'PENDING_APPROVAL' : undefined;
    fetchPayouts(status, page, 10);
  }, [activeTab, page, fetchPayouts]);

  const handleApprove = async (id: string) => {
    if (confirm('Deseja realmente APROVAR este payout?')) {
      const success = await approvePayout(id);
      if (success) {
        fetchPayouts(activeTab === 'pending' ? 'PENDING_APPROVAL' : undefined, page, 10);
      }
    }
  };

  const handleBlock = async (id: string) => {
    if (confirm('Deseja realmente BLOQUEAR este payout?')) {
      const success = await blockPayout(id);
      if (success) {
        fetchPayouts(activeTab === 'pending' ? 'PENDING_APPROVAL' : undefined, page, 10);
      }
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2 tracking-widest uppercase text-xs">
              <Wallet size={16} />
              Financeiro
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Monitoramento de Payouts</h1>
            <p className="text-slate-400 mt-2">Aprovação manual e histórico de liquidações.</p>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => { setActiveTab('pending'); setPage(1); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              activeTab === 'pending' 
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105' 
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Clock size={18} />
            Aguardando Aprovação
          </button>
          <button
            onClick={() => { setActiveTab('history'); setPage(1); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              activeTab === 'history' 
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105' 
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <History size={18} />
            Histórico Geral
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60">
                  <th className="px-8 py-5 text-xs font-black uppercase text-slate-500 tracking-widest">ID / Data</th>
                  <th className="px-8 py-5 text-xs font-black uppercase text-slate-500 tracking-widest">Prestador</th>
                  <th className="px-8 py-5 text-xs font-black uppercase text-slate-500 tracking-widest">Valor</th>
                  <th className="px-8 py-5 text-xs font-black uppercase text-slate-500 tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-black uppercase text-slate-500 tracking-widest">Dados Bancários (Mascarados)</th>
                  {activeTab === 'pending' && <th className="px-8 py-5 text-xs font-black uppercase text-slate-500 tracking-widest text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-500 font-bold animate-pulse">Carregando dados...</td>
                  </tr>
                ) : payouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-500 italic">Nenhum payout encontrado.</td>
                  </tr>
                ) : payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-mono text-[10px] text-slate-500">#{payout.id.slice(0, 8)}</div>
                      <div className="text-sm font-medium">{new Date(payout.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-white">{payout.providerName}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-tighter">ID: {payout.providerId}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-lg font-black text-emerald-400">R$ {(parseFloat(payout.amount) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      <div className="text-[10px] text-slate-500">Taxa: R$ {(parseFloat(payout.fee) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        payout.status === 'PENDING_APPROVAL' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        payout.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        payout.status === 'FAILED' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs font-mono text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                        {payout.maskedBankData}
                      </div>
                    </td>
                    {activeTab === 'pending' && (
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleApprove(payout.id)}
                            className="p-3 bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-emerald-500/20"
                            title="Aprovar Payout"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleBlock(payout.id)}
                            className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-400 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-rose-500/20"
                            title="Bloquear Payout"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 bg-slate-900/60 border-t border-slate-800 flex justify-between items-center text-sm">
            <div className="text-slate-500 font-medium">
              Mostrando <span className="text-white">{payouts.length}</span> de <span className="text-white">{total}</span> payouts
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center px-4 font-black text-emerald-400">
                Página {page} de {totalPages || 1}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-8 flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
          <AlertTriangle className="text-amber-500" size={20} />
          <p className="text-xs text-amber-500/80 font-medium">
            <strong>Aviso de Segurança:</strong> Todas as aprovações e bloqueios são registrados de forma imutável no Log de Auditoria Financeira com o seu ID de Administrador.
          </p>
        </div>
      </div>
    </div>
  );
}
