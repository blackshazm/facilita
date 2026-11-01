'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ExternalLink, 
  AlertTriangle,
  UserCheck,
  Search,
  Filter
} from 'lucide-react';

interface KycItem {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  specialty: string;
  pixKey: string;
  submittedAt: string;
  docType: string;
  docUrl: string;
  proofUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const INITIAL_SUBMISSIONS: KycItem[] = [
  {
    id: 'kyc-001',
    name: 'Carlos Andrade de Lima',
    cpf: '123.456.789-00',
    phone: '(11) 97777-6666',
    specialty: 'Eletricista Residencial',
    pixKey: 'carlos.eletrica@gmail.com',
    submittedAt: 'Hoje às 14:32',
    docType: 'CNH Digital (Frente/Verso)',
    docUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=60',
    proofUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=60',
    status: 'PENDING',
  },
  {
    id: 'kyc-002',
    name: 'Marcio Silva Tavares',
    cpf: '987.654.321-11',
    phone: '(11) 98888-5555',
    specialty: 'Encanador / Hidráulica',
    pixKey: '98765432111',
    submittedAt: 'Ontem às 18:45',
    docType: 'RG Frente e Verso',
    docUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=60',
    proofUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&auto=format&fit=crop&q=60',
    status: 'PENDING',
  },
];

export default function AdminKycPage() {
  const [submissions, setSubmissions] = useState<KycItem[]>(INITIAL_SUBMISSIONS);
  const [selectedKyc, setSelectedKyc] = useState<KycItem | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Foto do documento ilegível ou cortada');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setSubmissions(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'APPROVED' } : item))
    );
    setSuccessMessage('Prestador aprovado com sucesso! Acesso ao app liberado.');
    setTimeout(() => setSuccessMessage(null), 4000);
    setSelectedKyc(null);
  };

  const handleReject = () => {
    if (!selectedKyc) return;
    setSubmissions(prev =>
      prev.map(item =>
        item.id === selectedKyc.id ? { ...item, status: 'REJECTED' } : item
      )
    );
    setRejectModalOpen(false);
    setSuccessMessage(`Documentação recusada. Motivo: ${rejectReason}`);
    setTimeout(() => setSuccessMessage(null), 4000);
    setSelectedKyc(null);
  };

  const pendingCount = submissions.filter(s => s.status === 'PENDING').length;

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
              <ShieldCheck className="text-emerald-400" size={32} /> Central de Moderação KYC
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Validação de identidade, antecedentes e documentos de prestadores de serviço
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl">
            <span className="text-xs text-slate-400 font-semibold">Pendentes de Análise:</span>
            <span className="bg-amber-500/20 text-amber-300 font-black px-2.5 py-0.5 rounded-lg text-sm border border-amber-500/30">
              {pendingCount}
            </span>
          </div>
        </div>

        {/* Notificação de Sucesso */}
        {successMessage && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-sm flex items-center gap-3 shadow-lg">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Lista de Prestadores */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da Esquerda: Fila de Submissões */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Fila de Solicitações</span>
              <span className="text-xs text-slate-500">{submissions.length} total</span>
            </h2>

            <div className="space-y-3">
              {submissions.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedKyc(item)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedKyc?.id === item.id
                      ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">{item.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{item.specialty}</p>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : item.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {item.status === 'PENDING' ? 'Pendente' : item.status === 'APPROVED' ? 'Aprovado' : 'Rejeitado'}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{item.docType}</span>
                    <span>{item.submittedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna da Direita: Detalhes e Documentos */}
          <div className="lg:col-span-2">
            {selectedKyc ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <h2 className="text-xl font-black text-white">{selectedKyc.name}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      CPF: <span className="text-slate-200 font-mono">{selectedKyc.cpf}</span> • WhatsApp: <span className="text-slate-200">{selectedKyc.phone}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedKyc.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => setRejectModalOpen(true)}
                          className="px-4 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 font-bold rounded-xl text-xs border border-red-500/30 transition flex items-center gap-1.5"
                        >
                          <XCircle size={14} /> Rejeitar
                        </button>
                        <button
                          onClick={() => handleApprove(selectedKyc.id)}
                          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={14} /> Aprovar Prestador
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Grid de Informações Financeiras & Área */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block">Especialidade</span>
                    <span className="font-semibold text-white">{selectedKyc.specialty}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Chave PIX</span>
                    <span className="font-semibold text-emerald-400 font-mono">{selectedKyc.pixKey}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status Atual</span>
                    <span className="font-bold text-amber-400">{selectedKyc.status}</span>
                  </div>
                </div>

                {/* Visualizador dos Documentos */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} className="text-emerald-400" /> Documentos Enviados para Auditoria
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Documento de Identidade */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300">{selectedKyc.docType}</span>
                        <a
                          href={selectedKyc.docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          Abrir Original <ExternalLink size={12} />
                        </a>
                      </div>
                      <div className="h-48 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative group">
                        <img
                          src={selectedKyc.docUrl}
                          alt="Documento CNH/RG"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    {/* Comprovante de Residência */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300">Comprovante de Residência</span>
                        <a
                          href={selectedKyc.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          Abrir Original <ExternalLink size={12} />
                        </a>
                      </div>
                      <div className="h-48 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative group">
                        <img
                          src={selectedKyc.proofUrl}
                          alt="Comprovante de Residência"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <UserCheck size={48} className="text-slate-600 mb-3" />
                <p className="text-base font-bold text-slate-400">Selecione uma solicitação da lista</p>
                <p className="text-xs text-slate-600 mt-1 max-w-sm">
                  Clique sobre qualquer prestador na fila ao lado para auditar seus documentos e aprovar o acesso à plataforma.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Rejeição */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-white">Rejeitar Documentação</h3>
            </div>

            <p className="text-xs text-slate-400">
              Selecione o motivo da rejeição. O prestador receberá uma notificação orientando o reenvio:
            </p>

            <select
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="Foto do documento ilegível ou cortada">Foto do documento ilegível ou cortada</option>
              <option value="Documento de identidade vencido ou inválido">Documento de identidade vencido ou inválido</option>
              <option value="Comprovante de residência com mais de 90 dias">Comprovante de residência com mais de 90 dias</option>
              <option value="Divergência entre nome e titularidade da chave PIX">Divergência entre nome e titularidade da chave PIX</option>
              <option value="Antecedentes ou histórico inconsistente">Antecedentes ou histórico inconsistente</option>
            </select>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-red-600/20"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

