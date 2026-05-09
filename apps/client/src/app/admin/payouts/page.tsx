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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<any>(null);
  const [gatewayBalance, setGatewayBalance] = useState<string>('0');
  const { payouts, total, isLoading, fetchPayouts, approvePayout, blockPayout, startBatchPayout, getBatchStatus, getBalance } = usePayouts();

  useEffect(() => {
    const loadBalance = async () => {
      const balance = await getBalance();
      setGatewayBalance(balance);
    };
    loadBalance();
  }, [getBalance]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (batchId) {
      interval = setInterval(async () => {
        const status = await getBatchStatus(batchId);
        setBatchStatus(status);
        if (status?.status === 'COMPLETED' || status?.status?.startsWith('FAILED')) {
          setBatchId(null);
          fetchPayouts(activeTab === 'pending' ? 'PENDING_APPROVAL' : undefined, page, 10);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [batchId, getBatchStatus, activeTab, page, fetchPayouts]);

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

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === payouts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(payouts.map(p => p.id)));
    }
  };

  const handleStartBatch = async () => {
    if (confirm(`Deseja iniciar o processamento em lote de ${selectedIds.size} itens?`)) {
      const id = await startBatchPayout(Array.from(selectedIds));
      if (id) {
        setBatchId(id);
        setSelectedIds(new Set());
      }
    }
  };

  const selectedTotal = Array.from(selectedIds).reduce((acc, id) => {
    const p = payouts.find(p => p.id === id);
    return acc + (p ? parseFloat(p.amount) : 0);
  }, 0);

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

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Wallet size={24} />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Saldo Pagar.me</div>
              <div className="text-xl font-black text-white">R$ {(parseFloat(gatewayBalance) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
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
                  <th className="px-8 py-5 w-10">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={selectedIds.size > 0 && selectedIds.size === payouts.length}
                      className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/50"
                    />
                  </th>
                  <th className="px-8 py-5 text-xs font-black uppercase text-slate-500 tracking-widest">ID / Data</th>
                  <th className="px-8 py-5 text-xs font-black uppercase text-slate-500 tracking-widest">Prestador</th>
                  <th className="px-8 py-5 text-xs font-black uppercase text-slate-500 tracking-widest">Valor</th>
                  <th className="px-8 py-5 text-xs font-black uppercase text-slate-500 tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-black uppercase text-slate-500 tracking-widest">Dados Bancários</th>
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
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(payout.id)}
                        onChange={() => handleToggleSelect(payout.id)}
                        className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/50"
                      />
                    </td>
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

      {/* Floating Selection Summary */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-slate-900 border border-emerald-500/50 p-4 pr-6 rounded-full shadow-2xl shadow-emerald-500/20 backdrop-blur-xl flex items-center gap-6 animate-in slide-in-from-bottom-10">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center font-black">
                {selectedIds.size}
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Selecionados</div>
                <div className="text-lg font-black text-white">R$ {(selectedTotal / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <button 
              onClick={handleStartBatch}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-3 rounded-full font-black transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 size={18} />
              Processar Lote
            </button>
          </div>
        </div>
      )}

      {/* Batch Processing Modal */}
      {(batchId || batchStatus) && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-4">Processando Lote</h2>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-400 bg-emerald-400/10">
                    {batchStatus?.status || 'INICIANDO'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-emerald-400">
                    {batchStatus ? Math.round((batchStatus.processedCount / batchStatus.totalCount) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-800">
                <div 
                  style={{ width: `${batchStatus ? (batchStatus.processedCount / batchStatus.totalCount) * 100 : 0}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-500"
                ></div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total de Itens:</span>
                <span className="text-white font-bold">{batchStatus?.totalCount || selectedIds.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Processados:</span>
                <span className="text-white font-bold">{batchStatus?.processedCount || 0}</span>
              </div>
            </div>

            {batchStatus?.errorMessage && (
              <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-rose-500 shrink-0" size={18} />
                <p className="text-xs text-rose-500 font-medium">{batchStatus.errorMessage}</p>
              </div>
            )}

            {(batchStatus?.status === 'COMPLETED' || batchStatus?.status?.startsWith('FAILED')) && (
              <button 
                onClick={() => { setBatchStatus(null); setBatchId(null); }}
                className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
