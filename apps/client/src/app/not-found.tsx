import Link from 'next/link';
import { Home, Search, Wrench, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto shadow-2xl relative">
          <Wrench className="text-emerald-400 animate-pulse" size={42} />
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full">
            404
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Página não encontrada
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            O endereço que você tentou acessar não existe, foi movido ou está temporariamente indisponível.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-6 rounded-2xl transition shadow-lg shadow-emerald-500/20 text-sm"
          >
            <Home size={18} /> Ir para o Início
          </Link>
          <Link
            href="/new-order"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3.5 px-6 rounded-2xl border border-slate-700 transition text-sm"
          >
            <Search size={18} /> Pedir Serviço
          </Link>
        </div>

        <div className="pt-8 border-t border-slate-900 text-xs text-slate-500">
          Precisa de suporte? Contate <span className="text-emerald-400">suporte@facilita.com.br</span>
        </div>
      </div>
    </div>
  );
}

