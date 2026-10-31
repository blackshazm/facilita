'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { Search, CheckCircle2, Star, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

function CheckoutContent() {
  const [isSearching, setIsSearching] = useState(true);
  const params = useParams();
  const orderId = (params?.id as string) || 'ord-123';

  useEffect(() => {
    const timer = setTimeout(() => setIsSearching(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white px-4">
      {isSearching ? (
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center text-center animate-in fade-in">
          <div className="relative mb-8 mt-2">
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
            <div className="relative bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-6 rounded-full shadow-xl">
              <Search size={36} className="animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">Localizando Prestadores...</h1>
          <p className="text-slate-400 text-xs leading-relaxed max-w-[280px] mb-6">
            Buscando profissionais online com raio de cobertura na sua região e nota acima de 4.8.
          </p>

          <div className="w-full bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 mb-6 text-left space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Pedido:</span>
              <span className="font-mono text-slate-200">#{orderId.slice(0, 12)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Algoritmo:</span>
              <span className="text-emerald-400 font-semibold">Matching Inteligente Geo</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSearching(false)}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer transition"
          >
            <Zap size={14} /> Acelerar busca (Demo)
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md bg-slate-900 border border-emerald-500/30 p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-5 border border-emerald-500/30">
            <CheckCircle2 size={40} className="animate-bounce" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Prestador Confirmado!</h1>
          <p className="text-slate-400 text-xs mb-6">
            João Silva aceitou sua ordem e iniciou o deslocamento.
          </p>
          
          <div className="w-full bg-slate-850 p-4 rounded-2xl flex items-center gap-4 border border-slate-700 shadow-md mb-6 text-left">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-base font-bold shadow-md">
              JS
            </div>
            <div>
              <p className="font-bold text-white text-sm">João Silva</p>
              <div className="flex items-center text-xs text-slate-400 mt-0.5 gap-1.5">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span className="font-bold text-slate-200">4.9</span>
                <span>• Eletricista Verificado</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-blue-950/40 border border-blue-800/40 p-3.5 rounded-2xl text-[11px] text-blue-200 flex items-center gap-2.5 mb-6 text-left">
            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
            <span>Garantia de R$ 5.000 e seguro de execução válidos para este atendimento.</span>
          </div>
          
          <Link href={`/tracking/${orderId}`} className="w-full">
            <button 
              type="button"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 px-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Acompanhar Deslocamento em Tempo Real</span>
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Carregando checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

