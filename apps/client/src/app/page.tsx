'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ServiceCard } from '../components/ServiceCard';
import Link from 'next/link';
import { ShieldCheck, Clock, MapPin, Sparkles, Wrench, FileText, Lock, HeartHandshake } from 'lucide-react';

const MOCK_SERVICES = [
  { id: '1', name: 'Instalação de chuveiro', description: 'Troca/instalação de chuveiro elétrico. Não inclui o chuveiro nem fiação nova.', price: 'R$ 120,00', time: '1h' },
  { id: '2', name: 'Troca de torneira elétrica', description: 'Substituição de torneira elétrica. Inclui mão de obra e vedação básica.', price: 'R$ 100,00', time: '45min' },
  { id: '3', name: 'Instalação de ventilador', description: 'Montagem e instalação de ventilador de teto em ponto existente.', price: 'R$ 150,00', time: '1h 30m' },
  { id: '4', name: 'Troca de disjuntor', description: 'Substituição de disjuntor defeituoso no quadro de energia principal.', price: 'R$ 90,00', time: '30min' },
  { id: '5', name: 'Lustre / Luminária', description: 'Instalação de até 3 pontos de luz simples.', price: 'R$ 80,00', time: '45min' },
  { id: '6', name: 'Tomada / Interruptor', description: 'Instalação ou troca de até 3 tomadas ou interruptores.', price: 'R$ 110,00', time: '1h' },
];

export default function HomePage() {
  const router = useRouter();

  const handleSelectService = (service: typeof MOCK_SERVICES[0]) => {
    router.push(`/new-order?serviceId=${service.id}&name=${encodeURIComponent(service.name)}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div>
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-6 pt-12 pb-8 rounded-b-3xl shadow-xl">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-900/60 border border-blue-400/30 text-blue-200 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                  <ShieldCheck size={14} className="text-emerald-400" /> Plataforma Segura & Garantida
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">FACILITA Serviços</h1>
              <p className="text-blue-100 text-sm mt-1">Profissionais qualificados sob demanda na sua região em minutos.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/orders"
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/20 backdrop-blur-md transition shadow-sm"
              >
                Meus Pedidos
              </Link>
              <Link
                href="/provider/register"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-lg transition"
              >
                Seja um Prestador
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
          {/* Banner de Garantia */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                🛡️
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Garantia FACILITA de até R$ 5.000</p>
                <p className="text-[11px] text-slate-400">Prestadores verificados com antecedentes criminais e seguro contra danos.</p>
              </div>
            </div>
            <Link
              href="/new-order"
              className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md"
            >
              Novo Pedido →
            </Link>
          </div>

          {/* Categories (Tabs) */}
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Categorias de Serviços</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              <button className="px-5 py-2.5 bg-blue-600 text-white rounded-full font-bold text-xs whitespace-nowrap shadow-md flex items-center gap-1.5">
                ⚡ Elétrica
              </button>
              <button className="px-5 py-2.5 bg-slate-900 text-slate-400 rounded-full font-medium text-xs whitespace-nowrap border border-slate-800 opacity-70">
                💧 Hidráulica (Em breve)
              </button>
              <button className="px-5 py-2.5 bg-slate-900 text-slate-400 rounded-full font-medium text-xs whitespace-nowrap border border-slate-800 opacity-70">
                🔨 Pequenos Reparos (Em breve)
              </button>
              <button className="px-5 py-2.5 bg-slate-900 text-slate-400 rounded-full font-medium text-xs whitespace-nowrap border border-slate-800 opacity-70">
                🧹 Limpeza Pós-Obra (Em breve)
              </button>
            </div>
          </div>

          {/* Services List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" /> Serviços Disponíveis
              </h2>
              <span className="text-xs text-slate-400">Preços tabelados e transparentes</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_SERVICES.map(service => (
                <ServiceCard
                  key={service.id}
                  name={service.name}
                  description={service.description}
                  price={service.price}
                  time={service.time}
                  onSelect={() => handleSelectService(service)}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Footer Profissional com Links Legais e Suporte */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-900/60 pt-10 pb-8 px-4 text-xs text-slate-400">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-extrabold text-sm text-emerald-400 tracking-tight flex items-center gap-1.5">
              <Wrench size={16} /> FACILITA SERVIÇOS
            </span>
            <p className="text-slate-500">Tecnologia em intermediação de serviços sob demanda • CNPJ 00.000.000/0001-00</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/termos" className="hover:text-emerald-400 transition flex items-center gap-1">
              <FileText size={14} /> Termos de Uso
            </Link>
            <Link href="/privacidade" className="hover:text-emerald-400 transition flex items-center gap-1">
              <Lock size={14} /> Política de Privacidade (LGPD)
            </Link>
            <Link href="/provider/register" className="hover:text-emerald-400 transition flex items-center gap-1">
              <HeartHandshake size={14} /> Trabalhe Conosco
            </Link>
            <Link href="/admin" className="hover:text-slate-300 transition text-slate-600">
              Admin
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-6 pt-6 border-t border-slate-800/40 text-center text-slate-600 text-[11px]">
          © {new Date().getFullYear()} FACILITA. Todos os direitos reservados. Suporte: suporte@facilita.com.br
        </div>
      </footer>
    </div>
  );
}
