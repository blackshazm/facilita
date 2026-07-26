'use client';

import { useState } from 'react';
import { 
  Wrench, 
  MapPin, 
  CheckCircle2, 
  Star, 
  DollarSign, 
  BellRing, 
  Camera, 
  Navigation, 
  Clock, 
  ShieldCheck,
  Power,
  MessageSquare,
  Send,
  ShieldAlert,
  X
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'client' | 'provider' | 'system';
  text: string;
  timestamp: string;
  isBlocked?: boolean;
}

export default function ProviderDashboardPage() {
  const [isOnline, setIsOnline] = useState(true);
  
  // Job simulation state
  const [jobState, setJobState] = useState<'available' | 'in_progress' | 'completed'>('available');
  const [jobSubStep, setJobSubStep] = useState<'traveling' | 'arrived' | 'executing' | 'evidence_uploaded'>('traveling');
  const [evidenceName, setEvidenceName] = useState<string | null>(null);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'provider', text: 'Olá Maria! Já estou a caminho da Av. Paulista com todo o material.', timestamp: '14:32' },
    { id: '2', sender: 'client', text: 'Perfeito João, estou aguardando no apartamento 42.', timestamp: '14:33' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatWarning, setChatWarning] = useState<string | null>(null);

  const handleAcceptJob = () => {
    setJobState('in_progress');
    setJobSubStep('traveling');
  };

  const handleArrived = () => {
    setJobSubStep('arrived');
  };

  const handleUploadEvidence = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceName(file.name);
      setJobSubStep('evidence_uploaded');
    } else {
      setEvidenceName('evidencia_instalacao.jpg');
      setJobSubStep('evidence_uploaded');
    }
  };

  const handleCompleteJob = () => {
    setJobState('completed');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Regras de Antifraude Regex (Telefone, PIX, WhatsApp, combinação por fora)
    const phoneRegex = /(?:\+?55)?\s?\(?[1-9]{2}\)?\s?(?:9\d{4}|\d{4})[-\s]?\d{4}/;
    const pixRegex = /(?:pix|transferencia|desconto|por fora|direct|zap|whats|celular)/i;

    const isSuspicious = phoneRegex.test(inputMessage) || pixRegex.test(inputMessage);

    if (isSuspicious) {
      setChatWarning('⚠️ Mensagem bloqueada pelo filtro Antifraude: Tentativas de negociar por fora violam os termos de uso e anulam a Garantia FACILITA de R$ 5.000.');
      
      setChatMessages(prev => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'system',
          text: '⚠️ [CONTEÚDO BLOQUEADO PELO SISTEMA ANTIFRAUDE] A troca de telefones ou pagamentos externos invalida a cobertura do seguro da plataforma.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isBlocked: true
        }
      ]);
      setInputMessage('');
      return;
    }

    setChatWarning(null);
    const newMessage: ChatMessage = {
      id: String(Date.now()),
      sender: 'provider',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // Simula resposta da cliente
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'client',
          text: 'Ok, estou te aguardando!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Principal */}
        <header className="bg-slate-800 border border-slate-700 rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner">
              JS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">João Silva</h1>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} /> Verificado • PRATA
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-2">
                <span>Eletricista Credenciado</span> • 
                <span className="flex items-center text-amber-400 gap-1 font-semibold">
                  <Star size={14} className="fill-current" /> 4.9 (120 serviços)
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-700 pt-4 md:pt-0">
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition relative"
            >
              <MessageSquare size={18} /> Chat com Cliente
              <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
            </button>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Status do Prestador</span>
              <span className={`text-sm font-bold ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isOnline ? 'ONLINE (Disponível)' : 'OFFLINE (Indisponível)'}
              </span>
            </div>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`w-14 h-8 rounded-full transition-all relative p-1 ${
                isOnline ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-slate-950 transition-all ${
                  isOnline ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </header>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Saldo Disponível (Carteira)</span>
            <span className="text-3xl font-extrabold text-emerald-400">R$ 1.450,00</span>
            <span className="text-xs text-emerald-400/80 block mt-1">Repasse via PIX em até 24h</span>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Serviços Concluídos (Mês)</span>
            <span className="text-3xl font-extrabold text-white">28</span>
            <span className="text-xs text-slate-400 block mt-1">Taxa de aceitação de 98%</span>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Próximo Nível (Tier OURO)</span>
            <span className="text-3xl font-extrabold text-amber-400">85%</span>
            <span className="text-xs text-slate-400 block mt-1">Faltam 5 serviços de 5 estrelas</span>
          </div>
        </div>

        {/* Área Central: Gerenciamento de Chamados */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BellRing className="text-emerald-400" size={22} /> Central de Chamados em Tempo Real
            </h2>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
              Matching Engine Ativo
            </span>
          </div>

          {/* Estado 1: Chamado Disponível */}
          {jobState === 'available' && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Novo Chamado Próximo (3.2 km)
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">Instalação de Tomada / Interruptor</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Cliente: <strong className="text-slate-200">Maria Oliveira</strong> • Av. Paulista, 1000 - São Paulo/SP
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Valor do Serviço</span>
                  <span className="text-2xl font-extrabold text-emerald-400">R$ 120,00</span>
                </div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl text-xs text-slate-300">
                <strong className="text-slate-200">Descrição do Problema:</strong> "Troca de tomada da cozinha com vazamento de corrente e risco de curto-circuito."
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAcceptJob}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} /> Aceitar Chamado Agora
                </button>
              </div>
            </div>
          )}

          {/* Estado 2: Serviço em Andamento */}
          {jobState === 'in_progress' && (
            <div className="bg-slate-900 border border-blue-500/40 rounded-2xl p-6 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="bg-blue-950 text-blue-400 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    Serviço em Andamento
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">Instalação de Tomada - Maria Oliveira</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Endereço de Destino</span>
                  <span className="text-sm font-semibold text-slate-200 flex items-center gap-1">
                    <MapPin size={14} className="text-emerald-400" /> Av. Paulista, 1000
                  </span>
                </div>
              </div>

              {/* Linha de Tempo do Serviço */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-4 rounded-xl border text-center transition ${
                  jobSubStep === 'traveling' ? 'border-blue-500 bg-blue-950/40 text-blue-300 font-bold' : 'border-slate-800 bg-slate-800/50 text-slate-500'
                }`}>
                  <Navigation size={20} className="mx-auto mb-1" />
                  <span className="text-xs block">1. A Caminho</span>
                </div>

                <div className={`p-4 rounded-xl border text-center transition ${
                  jobSubStep === 'arrived' || jobSubStep === 'evidence_uploaded' ? 'border-blue-500 bg-blue-950/40 text-blue-300 font-bold' : 'border-slate-800 bg-slate-800/50 text-slate-500'
                }`}>
                  <MapPin size={20} className="mx-auto mb-1" />
                  <span className="text-xs block">2. No Local do Cliente</span>
                </div>

                <div className={`p-4 rounded-xl border text-center transition ${
                  jobSubStep === 'evidence_uploaded' ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold' : 'border-slate-800 bg-slate-800/50 text-slate-500'
                }`}>
                  <Camera size={20} className="mx-auto mb-1" />
                  <span className="text-xs block">3. Evidência Enviada</span>
                </div>
              </div>

              {/* Botões de Ação por Etapa */}
              {jobSubStep === 'traveling' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="w-1/3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={18} /> Chat
                  </button>
                  <button
                    onClick={handleArrived}
                    className="w-2/3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <MapPin size={20} /> Marcar "Cheguei ao Local"
                  </button>
                </div>
              )}

              {(jobSubStep === 'arrived' || jobSubStep === 'evidence_uploaded') && (
                <div className="space-y-4">
                  <div className="bg-slate-800 border border-dashed border-slate-700 rounded-xl p-4 text-center">
                    <Camera size={24} className="mx-auto text-emerald-400 mb-2" />
                    <span className="text-xs text-slate-300 block font-semibold">
                      {evidenceName ? `Evidência: ${evidenceName}` : 'Tirar Foto do Serviço Concluído (Evidência)'}
                    </span>
                    <input
                      type="file"
                      onChange={handleUploadEvidence}
                      className="mt-2 text-xs text-slate-400 block mx-auto"
                    />
                  </div>

                  <button
                    onClick={handleCompleteJob}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} /> Finalizar e Solicitar Repasse
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Estado 3: Serviço Concluído */}
          {jobState === 'completed' && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-xl font-extrabold text-emerald-400">Serviço Concluído com Sucesso!</h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                O valor de <strong className="text-white">R$ 120,00</strong> foi creditado na sua carteira do FACILITA e a solicitação de repasse PIX foi enviada para aprovação do sistema.
              </p>
              <button
                onClick={() => {
                  setJobState('available');
                  setJobSubStep('traveling');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-3 rounded-xl text-sm transition"
              >
                Voltar à Central de Chamados
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Modal / Drawer do Chat Protegido do Prestador */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[550px] animate-in fade-in zoom-in-95">
            
            {/* Header do Chat */}
            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                  MO
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Maria Oliveira (Cliente)</h3>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    🛡️ Chat Monitorado por Filtro Antifraude
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mensagem de Aviso Antifraude */}
            {chatWarning && (
              <div className="bg-red-950/90 border-b border-red-500/40 p-3 text-xs text-red-200 flex items-start gap-2">
                <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span>{chatWarning}</span>
              </div>
            )}

            {/* Mensagens do Chat */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/50">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'provider'
                      ? 'items-end'
                      : msg.sender === 'system'
                      ? 'items-center'
                      : 'items-start'
                  }`}
                >
                  {msg.sender === 'system' ? (
                    <div className="bg-red-950/80 border border-red-500/50 text-red-300 text-xs p-3 rounded-2xl text-center max-w-[90%] font-medium">
                      {msg.text}
                    </div>
                  ) : (
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                        msg.sender === 'provider'
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[10px] text-slate-400 block text-right">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Form de Envio */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
              <input
                type="text"
                placeholder="Digite sua mensagem (ex: testar filtro antifraude)..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold p-2.5 rounded-xl transition flex items-center justify-center"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
