'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Scale,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  DollarSign,
  User,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface DisputeItem {
  id: string;
  orderId: string;
  reason: string;
  description: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  outcome?: string | null;
  createdAt: string;
  updatedAt: string;
}

const INITIAL_DISPUTES: DisputeItem[] = [
  {
    id: 'disp-001',
    orderId: 'ord-8831',
    reason: 'Serviço com defeito recorrente',
    description: 'Após a instalação do chuveiro, a resistência queimou e houve vazamento na fiação.',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'disp-002',
    orderId: 'ord-7742',
    reason: 'Não comparecimento (No-Show)',
    description: 'Prestador confirmou chegada mas não compareceu no endereço agendado.',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>(INITIAL_DISPUTES);
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<'REFUND_FULL' | 'SPLIT_50_50' | 'RELEASE_PROVIDER'>('SPLIT_50_50');
  const [mediationNotes, setMediationNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/disputes?pending=true`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setDisputes(data);
        }
      }
    } catch {
      // Fallback para mock local
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async () => {
    if (!selectedDispute) return;
    setIsProcessing(true);

    try {
      await fetch(`${API_URL}/disputes/${selectedDispute.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outcome: selectedOutcome,
          notes: mediationNotes,
        }),
      });
    } catch (e) {
      console.warn('Erro ao chamar API de resolução, aplicando localmente:', e);
    }

    setDisputes(prev =>
      prev.map(item =>
        item.id === selectedDispute.id
          ? { ...item, status: 'RESOLVED', outcome: `${selectedOutcome}: ${mediationNotes}` }
          : item
      )
    );

    const outcomeLabels = {
      REFUND_FULL: 'Estorno 100% ao Cliente',
      SPLIT_50_50: 'Partilha 50/50',
      RELEASE_PROVIDER: 'Repasse Integral ao Prestador',
    };

    setSuccessMessage(`Disputa resolvida com sucesso: ${outcomeLabels[selectedOutcome]}`);
    setTimeout(() => setSuccessMessage(null), 5000);
    setResolveModalOpen(false);
    setSelectedDispute(null);
    setMediationNotes('');
    setIsProcessing(false);
  };

  const openCount = disputes.filter(d => d.status === 'OPEN').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition mb-3"
            >
              <ArrowLeft size={14} /> Voltar para o Dashboard Admin
            </Link>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Scale className="text-amber-400" size={32} /> Central de Disputas & Mediação
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Arbitragem de desacordos comerciais, estornos e liberação de pagamentos em custódia
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDisputes}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 transition"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Atualizar
            </button>
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl">
              <span className="text-xs text-slate-400 font-semibold">Disputas Abertas:</span>
              <span className="bg-amber-500/20 text-amber-300 font-black px-2.5 py-0.5 rounded-lg text-sm border border-amber-500/30">
                {openCount}
              </span>
            </div>
          </div>
        </div>

        {/* Notificação de Sucesso */}
        {successMessage && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-sm flex items-center gap-3 shadow-lg">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fila de Disputas */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Fila de Mediação</span>
              <span className="text-xs text-slate-500">{disputes.length} total</span>
            </h2>

            <div className="space-y-3">
              {disputes.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedDispute(item)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    selectedDispute?.id === item.id
                      ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white">{item.reason}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Pedido: #{item.orderId}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        item.status === 'OPEN'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{item.description}</p>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <span>ID: {item.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detalhes e Ações de Mediação */}
          <div className="lg:col-span-2">
            {selectedDispute ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                      Disputa Ativa #{selectedDispute.id}
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1">{selectedDispute.reason}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Pedido Vinculado: <span className="font-mono text-slate-200">#{selectedDispute.orderId}</span>
                    </p>
                  </div>

                  {selectedDispute.status === 'OPEN' && (
                    <button
                      onClick={() => setResolveModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition"
                    >
                      <Scale size={16} /> Arbitrar Desfecho
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Relato do Solicitante
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed">{selectedDispute.description}</p>
                  </div>

                  {selectedDispute.outcome && (
                    <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-2xl space-y-1">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                        Desfecho Aplicado
                      </span>
                      <p className="text-sm text-emerald-200 font-semibold">{selectedDispute.outcome}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-96 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <ShieldAlert size={48} className="text-slate-600 mb-3" />
                <p className="text-base font-bold text-slate-400">Selecione uma disputa da lista</p>
                <p className="text-xs text-slate-600 mt-1 max-w-sm">
                  Clique sobre qualquer disputa ao lado para analisar o caso e arbitrar entre reembolso, partilha ou liberação ao prestador.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Resolução de Conflito */}
      {resolveModalOpen && selectedDispute && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <Scale size={24} />
              <h3 className="text-lg font-bold text-white">Arbitragem da Disputa</h3>
            </div>

            <p className="text-xs text-slate-400">
              Selecione o desfecho financeiro que será executado para o pedido #{selectedDispute.orderId}:
            </p>

            {/* Opções de Desfecho */}
            <div className="space-y-3">
              <label
                onClick={() => setSelectedOutcome('REFUND_FULL')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedOutcome === 'REFUND_FULL'
                    ? 'bg-red-950/30 border-red-500/80'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  checked={selectedOutcome === 'REFUND_FULL'}
                  onChange={() => setSelectedOutcome('REFUND_FULL')}
                  className="mt-1 accent-red-500"
                />
                <div>
                  <span className="font-bold text-xs text-red-400 block">Estorno Integral (100% ao Cliente)</span>
                  <span className="text-[11px] text-slate-400">
                    O valor pago é devolvido integralmente ao cliente via PIX/Cartão. Nenhum valor é repassado ao prestador.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setSelectedOutcome('SPLIT_50_50')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedOutcome === 'SPLIT_50_50'
                    ? 'bg-amber-950/30 border-amber-500/80'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  checked={selectedOutcome === 'SPLIT_50_50'}
                  onChange={() => setSelectedOutcome('SPLIT_50_50')}
                  className="mt-1 accent-amber-500"
                />
                <div>
                  <span className="font-bold text-xs text-amber-400 block">Partilha Amigável (50% / 50%)</span>
                  <span className="text-[11px] text-slate-400">
                    50% é estornado ao cliente e 50% é liberado para a carteira do prestador para cobrir custos de deslocamento.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setSelectedOutcome('RELEASE_PROVIDER')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedOutcome === 'RELEASE_PROVIDER'
                    ? 'bg-emerald-950/30 border-emerald-500/80'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  checked={selectedOutcome === 'RELEASE_PROVIDER'}
                  onChange={() => setSelectedOutcome('RELEASE_PROVIDER')}
                  className="mt-1 accent-emerald-500"
                />
                <div>
                  <span className="font-bold text-xs text-emerald-400 block">Repasse Integral ao Prestador</span>
                  <span className="text-[11px] text-slate-400">
                    A reclamação é considerada improcedente e o valor em custódia é liberado integralmente ao prestador.
                  </span>
                </div>
              </label>
            </div>

            {/* Parecer do Mediador */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Parecer da Mediação / Justificativa:</label>
              <textarea
                value={mediationNotes}
                onChange={e => setMediationNotes(e.target.value)}
                placeholder="Descreva o motivo da decisão para fins de auditoria e registro no chamado..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setResolveModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleResolve}
                disabled={isProcessing}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Confirmar Arbitragem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
