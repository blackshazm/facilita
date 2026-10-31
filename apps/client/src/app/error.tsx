'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para auditoria ou APM
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-16">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-20 h-20 bg-red-950/60 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto shadow-xl">
          <AlertTriangle size={36} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">
            Ocorreu um erro inesperado
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Nossa equipe foi notificada automaticamente. Você pode tentar recarregar esta tela ou voltar ao início.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-500 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 inline-block mt-2">
              Protocolo: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-6 rounded-2xl transition shadow-lg shadow-emerald-500/20 text-sm cursor-pointer"
          >
            <RefreshCw size={18} /> Tentar Novamente
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3.5 px-6 rounded-2xl border border-slate-700 transition text-sm"
          >
            <Home size={18} /> Início
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
          Suporte: <span className="text-emerald-400">suporte@facilita.com.br</span>
        </div>
      </div>
    </div>
  );
}

