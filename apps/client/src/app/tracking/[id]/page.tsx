'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Wrench, CheckCircle, PhoneCall, Star, AlertTriangle, MessageSquare, Send, ShieldAlert, X, ShieldCheck, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { socket } from '@/lib/socket';

const LiveMap = dynamic(() => import('@/components/LiveMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-sm animate-pulse">
      Carregando mapa em tempo real...
    </div>
  )
});

interface ChatMessage {
  id: string;
  sender: 'client' | 'provider' | 'system';
  text: string;
  timestamp: string;
  isBlocked?: boolean;
}

function TrackingContent() {
  const params = useParams();
  const id = (params?.id as string) || 'ord-123';
  const [jobStatus, setJobStatus] = useState<'A Caminho' | 'Em Andamento' | 'Concluído'>('A Caminho');
  // Coordenadas iniciais padrão (Av. Paulista, SP)
  const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: -23.561684, lng: -46.655981 });
  const [signalLost, setSignalLost] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'provider', text: 'Olá! Já estou a caminho com ferramentas e peças testadas.', timestamp: '14:32' },
    { id: '2', sender: 'client', text: 'Perfeito João, estou aguardando no local.', timestamp: '14:33' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatWarning, setChatWarning] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit('subscribeToOrder', id);

      const handleLocationUpdate = (data: { lat: number; lng: number }) => {
        if (data?.lat && data?.lng) {
          setLocation({ lat: data.lat, lng: data.lng });
          setSignalLost(false);
        }

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          setSignalLost(true);
        }, 30000);
      };

      socket.on('locationUpdated', handleLocationUpdate);

      return () => {
        socket.off('locationUpdated', handleLocationUpdate);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        socket.disconnect();
      };
    } catch {
      // Silencioso se o socket não estiver no ar em modo dev isolado
    }
  }, [id]);

  const handleUpdateStatusDemo = (status: 'A Caminho' | 'Em Andamento' | 'Concluído') => {
    setJobStatus(status);
    if (status === 'A Caminho') {
      setLocation({ lat: -23.561684, lng: -46.655981 });
    } else if (status === 'Em Andamento') {
      setLocation({ lat: -23.558712, lng: -46.660144 });
    } else {
      setLocation({ lat: -23.555555, lng: -46.663333 });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Regras de Antifraude Regex (Telefone, PIX, WhatsApp, combinação por fora)
    const phoneRegex = /(?:\+?55)?\s?\(?[1-9]{2}\)?\s?(?:9\d{4}|\d{4})[-\s]?\d{4}/;
    const pixRegex = /(?:pix|transferencia|desconto|por fora|direct|zap|whats|celular|dinheiro por fora)/i;

    const isSuspicious = phoneRegex.test(inputMessage) || pixRegex.test(inputMessage);

    if (isSuspicious) {
      setChatWarning('⚠️ Mensagem bloqueada pelo filtro Antifraude: Tentativas de negociar por fora violam os termos de uso e anulam a Garantia FACILITA de R$ 5.000.');
      
      setChatMessages(prev => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'system',
          text: '⚠️ [CONTEÚDO BLOQUEADO PELO SISTEMA ANTIFRAUDE] A troca de contatos diretos ou pagamentos externos invalida a cobertura de seguro da plataforma.',
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
      sender: 'client',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // Simula resposta automática do prestador
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'provider',
          text: 'Combinado! Estou focado no trajeto e chego em poucos minutos.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-sm md:text-base font-bold text-white">Serviço #{id.slice(0, 10)}</h1>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Em tempo real
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg transition active:scale-95 cursor-pointer"
          >
            <MessageSquare size={16} /> Chat ao Vivo
          </button>
        </div>
      </header>

      <main className="px-4 mt-6 max-w-xl mx-auto flex flex-col gap-6">
        
        {/* Banner de Garantia & Antifraude */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-200">Garantia FACILITA de R$ 5.000 Ativa</p>
            <p className="text-slate-400 text-[11px]">Pagamentos e contatos protegidos dentro da plataforma.</p>
          </div>
        </div>

        {/* Mapa em Tempo Real */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-slate-900">
          <LiveMap lat={location.lat} lng={location.lng} />
          {signalLost && (
            <div className="absolute top-3 left-3 right-3 bg-red-950/90 border border-red-500 text-red-200 px-3 py-2 rounded-xl flex items-center gap-2 text-xs shadow-md z-[1000]">
              <AlertTriangle size={16} className="text-red-400 shrink-0" />
              <span>Sinal de GPS do prestador temporariamente offline</span>
            </div>
          )}
        </div>

        {/* Card do Prestador */}
        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-md">
              JS
            </div>
            <div>
              <h2 className="text-base font-bold text-white">João Silva</h2>
              <div className="flex items-center text-xs text-slate-400 mt-1 gap-1.5">
                <span className="text-blue-400 font-medium">Eletricista Profissional</span>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                  <Star size={13} className="fill-amber-400" /> 4.9
                </span>
                <span>(120 atendimentos)</span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 p-3 rounded-2xl transition border border-blue-500/20 relative cursor-pointer"
                title="Abrir Chat"
              >
                <MessageSquare size={18} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
              </button>
              <a 
                href="tel:0800000000" 
                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 p-3 rounded-2xl transition border border-emerald-500/20"
                title="Central de Atendimento"
              >
                <PhoneCall size={18} />
              </a>
            </div>
          </div>

          {/* Timeline de Status */}
          <div>
            <h3 className="font-bold text-slate-300 mb-6 text-center text-sm uppercase tracking-wider">Status do Atendimento</h3>
            
            <div className="flex flex-col gap-0 px-2">
              <div className={`flex items-center gap-4 transition-all duration-300 ${jobStatus === 'A Caminho' ? 'opacity-100' : 'opacity-60'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-colors ${jobStatus === 'A Caminho' || jobStatus === 'Em Andamento' || jobStatus === 'Concluído' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  <MapPin size={20} className={jobStatus === 'A Caminho' ? 'animate-bounce' : ''} />
                </div>
                <div>
                  <p className={`font-bold text-sm ${jobStatus === 'A Caminho' ? 'text-blue-400' : 'text-slate-300'}`}>Prestador a caminho</p>
                  <p className="text-[11px] text-slate-500">Estimativa de chegada: 8 minutos</p>
                </div>
              </div>
              
              <div className={`w-0.5 h-6 ml-5 transition-colors duration-500 ${jobStatus === 'Em Andamento' || jobStatus === 'Concluído' ? 'bg-blue-600' : 'bg-slate-800'}`}></div>
              
              <div className={`flex items-center gap-4 transition-all duration-300 ${jobStatus === 'Em Andamento' ? 'opacity-100' : 'opacity-60'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-colors ${jobStatus === 'Em Andamento' || jobStatus === 'Concluído' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  <Wrench size={20} />
                </div>
                <div>
                  <p className={`font-bold text-sm ${jobStatus === 'Em Andamento' ? 'text-blue-400' : 'text-slate-300'}`}>Serviço em andamento</p>
                  <p className="text-[11px] text-slate-500">Execução técnica no local</p>
                </div>
              </div>
              
              <div className={`w-0.5 h-6 ml-5 transition-colors duration-500 ${jobStatus === 'Concluído' ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
              
              <div className={`flex items-center gap-4 transition-all duration-300 ${jobStatus === 'Concluído' ? 'opacity-100' : 'opacity-60'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-colors ${jobStatus === 'Concluído' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className={`font-bold text-sm ${jobStatus === 'Concluído' ? 'text-emerald-400' : 'text-slate-300'}`}>Serviço concluído</p>
                  <p className="text-[11px] text-slate-500">Garantia de 90 dias ativada</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de Demonstração Interativos */}
        <div className="bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-800 text-center space-y-3">
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Controles de Demonstração (Simular Status)</p>
          <div className="grid grid-cols-3 gap-2">
            <button 
              type="button"
              onClick={() => handleUpdateStatusDemo('A Caminho')} 
              className={`py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer ${jobStatus === 'A Caminho' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'}`}
            >
              🚗 A Caminho
            </button>
            <button 
              type="button"
              onClick={() => handleUpdateStatusDemo('Em Andamento')} 
              className={`py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer ${jobStatus === 'Em Andamento' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'}`}
            >
              🔧 No Local
            </button>
            <button 
              type="button"
              onClick={() => handleUpdateStatusDemo('Concluído')} 
              className={`py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer ${jobStatus === 'Concluído' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'}`}
            >
              ✅ Concluído
            </button>
          </div>
        </div>
      </main>

      {/* Modal do Chat Protegido em Tempo Real */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[550px] animate-in fade-in zoom-in-95">
            
            {/* Header do Chat */}
            <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  JS
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">João Silva (Prestador)</h3>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    🛡️ Chat com Filtro Antifraude Ativo
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
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
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'client'
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
                        msg.sender === 'client'
                          ? 'bg-blue-600 text-white rounded-tr-none'
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
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition flex items-center justify-center cursor-pointer"
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

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Carregando rastreamento...</div>}>
      <TrackingContent />
    </Suspense>
  );
}

