'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Wrench, CheckCircle, PhoneCall, Star, AlertTriangle, MessageSquare, Send, ShieldAlert, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { socket } from '@/lib/socket';

const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

interface ChatMessage {
  id: string;
  sender: 'client' | 'provider' | 'system';
  text: string;
  timestamp: string;
  isBlocked?: boolean;
}

export default function TrackingPage() {
  const params = useParams();
  const id = params.id as string;
  const [jobStatus, setJobStatus] = useState<'A Caminho' | 'Em Andamento' | 'Concluído'>('A Caminho');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [signalLost, setSignalLost] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'provider', text: 'Olá Maria! Já estou a caminho da Av. Paulista com todo o material.', timestamp: '14:32' },
    { id: '2', sender: 'client', text: 'Perfeito João, estou aguardando no apartamento 42.', timestamp: '14:33' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatWarning, setChatWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('subscribeToOrder', id);

    const handleLocationUpdate = (data: { lat: number; lng: number }) => {
      setLocation({ lat: data.lat, lng: data.lng });
      setSignalLost(false);

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
  }, [id]);

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
          text: 'Combinado! Chego em aproximadamente 8 minutos.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10 max-w-lg mx-auto">
        <h1 className="text-lg font-bold text-gray-900">Acompanhar Serviço #{id}</h1>
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition"
        >
          <MessageSquare size={16} /> Chat ao Vivo
        </button>
      </header>

      <main className="px-4 mt-6 max-w-lg mx-auto flex flex-col gap-6">
        
        {location && (
          <div className="relative">
            <LiveMap lat={location.lat} lng={location.lng} />
            {signalLost && (
              <div className="absolute top-2 left-2 right-2 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm shadow-md z-[1000]">
                <AlertTriangle size={18} />
                <span>Sinal do provedor perdido</span>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-5 mb-5">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold shadow-inner">
              JS
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">João Silva</h2>
              <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                <span>Eletricista</span> • <Star size={14} className="text-yellow-400 fill-current" /> <span className="font-medium">4.9</span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setIsChatOpen(true)}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-3 rounded-full transition-colors shadow-sm relative"
                title="Abrir Chat"
              >
                <MessageSquare size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
              </button>
              <a href="tel:000" className="bg-green-50 hover:bg-green-100 text-green-600 p-3 rounded-full transition-colors shadow-sm">
                <PhoneCall size={20} />
              </a>
            </div>
          </div>

          <h3 className="font-bold text-gray-800 mb-6 text-center text-lg">Status do Pedido</h3>
          
          <div className="flex flex-col gap-0 px-4">
            <div className={`flex items-center gap-4 transition-all duration-300 ${jobStatus === 'A Caminho' ? 'opacity-100 scale-105' : 'opacity-60'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${jobStatus === 'A Caminho' || jobStatus === 'Em Andamento' || jobStatus === 'Concluído' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <MapPin size={20} className={jobStatus === 'A Caminho' ? 'animate-bounce' : ''} />
              </div>
              <span className={`font-bold text-lg ${jobStatus === 'A Caminho' ? 'text-blue-600' : 'text-gray-700'}`}>Prestador a caminho</span>
            </div>
            
            <div className={`w-0.5 h-8 ml-5 transition-colors duration-500 ${jobStatus === 'Em Andamento' || jobStatus === 'Concluído' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center gap-4 transition-all duration-300 ${jobStatus === 'Em Andamento' ? 'opacity-100 scale-105' : 'opacity-60'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${jobStatus === 'Em Andamento' || jobStatus === 'Concluído' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <Wrench size={20} />
              </div>
              <span className={`font-bold text-lg ${jobStatus === 'Em Andamento' ? 'text-blue-600' : 'text-gray-700'}`}>Serviço em andamento</span>
            </div>
            
            <div className={`w-0.5 h-8 ml-5 transition-colors duration-500 ${jobStatus === 'Concluído' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center gap-4 transition-all duration-300 ${jobStatus === 'Concluído' ? 'opacity-100 scale-105' : 'opacity-60'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${jobStatus === 'Concluído' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <CheckCircle size={20} />
              </div>
              <span className={`font-bold text-lg ${jobStatus === 'Concluído' ? 'text-green-600' : 'text-gray-700'}`}>Serviço concluído</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3">Controles de Demonstração</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => setJobStatus('A Caminho')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg">A Caminho</button>
            <button onClick={() => setJobStatus('Em Andamento')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg">Iniciou</button>
            <button onClick={() => setJobStatus('Concluído')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg">Fim</button>
          </div>
        </div>
      </main>

      {/* Modal / Drawer do Chat Protegido em Tempo Real */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition flex items-center justify-center"
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
