'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ServiceOption {
  id: string;
  category: string;
  name: string;
  basePrice: number;
  description: string;
}

const SERVICES: ServiceOption[] = [
  { id: '1', category: 'Eletricista', name: 'Instalação de chuveiro elétrico', basePrice: 120.0, description: 'Fixação, fiação de proteção e teste de aquecimento seguro.' },
  { id: '2', category: 'Eletricista', name: 'Troca de torneira elétrica', basePrice: 100.0, description: 'Substituição com mão de obra especializada e vedação básica.' },
  { id: '3', category: 'Eletricista', name: 'Instalação de ventilador de teto', basePrice: 150.0, description: 'Montagem e instalação de ventilador em ponto existente.' },
  { id: '4', category: 'Eletricista', name: 'Troca de disjuntor defeituoso', basePrice: 90.0, description: 'Substituição no quadro principal para proteção contra sobrecarga.' },
  { id: '5', category: 'Eletricista', name: 'Instalação de Tomada / Interruptor', basePrice: 110.0, description: 'Instalação ou substituição de até 3 tomadas ou interruptores.' },
  { id: 'srv-3', category: 'Encanador', name: 'Reparo de Vazamento de Torneira/Sifão', basePrice: 110.0, description: 'Troca de vedações, reparo ou substituição do sifão.' },
  { id: 'srv-4', category: 'Encanador', name: 'Desentupimento de Pia ou Vaso', basePrice: 150.0, description: 'Desobstrução de encanamento de esgoto sanitário.' },
  { id: 'srv-5', category: 'Pequenos Reparos', name: 'Montagem de Móveis (até 2m)', basePrice: 130.0, description: 'Montagem de estantes, mesas, prateleiras ou armários pequenos.' },
  { id: 'srv-6', category: 'Pequenos Reparos', name: 'Instalação de Suporte de TV', basePrice: 100.0, description: 'Fixação segura na parede em alvenaria ou drywall.' },
];

function NewOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceIdParam = searchParams.get('serviceId');

  const [selectedService, setSelectedService] = useState<ServiceOption | null>(
    SERVICES.find(s => s.id === serviceIdParam) || SERVICES[0]
  );
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (serviceIdParam) {
      const match = SERVICES.find(s => s.id === serviceIdParam);
      if (match) setSelectedService(match);
    }
  }, [serviceIdParam]);

  const totalPrice = selectedService ? (urgency === 'urgent' ? selectedService.basePrice * 1.25 : selectedService.basePrice) : 0;

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setLoading(true);
    const mockOrderId = `ord-${Date.now()}`;

    setTimeout(() => {
      router.push(`/checkout/${mockOrderId}`);
    }, 400);
  };


  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-emerald-400">Solicitar Novo Serviço</h1>
            <p className="text-slate-400 text-sm mt-1">Preço fixo garantido • Prestadores verificados com seguro de até R$ 5.000</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-right">
            <span className="text-xs text-slate-400 block">Preço estimado</span>
            <span className="text-2xl font-bold text-emerald-400">R$ {totalPrice.toFixed(2)}</span>
          </div>
        </header>

        <form onSubmit={handleCreateOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coluna 1 & 2: Seleção e Triagem */}
          <div className="md:col-span-2 space-y-6">
            {/* Seleção de Serviço */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <span>1.</span> Escolha o Serviço
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICES.map((srv) => {
                  const isSelected = selectedService?.id === srv.id;

                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/30'
                          : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-xs font-semibold text-emerald-400 block uppercase tracking-wider">
                        {srv.category}
                      </span>
                      <h3 className="font-bold text-sm text-slate-100 mt-1">{srv.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{srv.description}</p>
                      <span className="text-sm font-bold text-emerald-400 block mt-3">
                        R$ {srv.basePrice.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detalhes e Fotos */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <span>2.</span> Detalhe o problema
              </h2>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Observações para o prestador (opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: A tomada fica atrás do sofá na sala. Trazer escada pequena..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Upload de Foto */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  Foto do local ou equipamento (ajuda o prestador)
                </label>
                <div
                  onClick={() => setPhotoUrl('https://placeholder.co/600x400/064e3b/ffffff?text=LOCAL+DO+SERVICO')}
                  className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer bg-slate-900 transition-colors"
                >
                  {photoUrl ? (
                    <div className="text-emerald-400 font-semibold text-sm">
                      ✓ Foto do local anexada (Clique para alterar)
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs">
                      📷 Clique para anexar uma foto do local
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Urgência */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <span>3.</span> Urgência do Atendimento
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setUrgency('normal')}
                  className={`p-4 rounded-xl border cursor-pointer ${
                    urgency === 'normal'
                      ? 'border-emerald-500 bg-emerald-950/30'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  <h4 className="font-bold text-sm text-slate-100">📅 Agendado / Normal</h4>
                  <p className="text-xs text-slate-400 mt-1">Atendimento no mesmo dia ou próximo horário disponível.</p>
                </div>

                <div
                  onClick={() => setUrgency('urgent')}
                  className={`p-4 rounded-xl border cursor-pointer ${
                    urgency === 'urgent'
                      ? 'border-emerald-500 bg-emerald-950/30'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  <h4 className="font-bold text-sm text-emerald-400">⚡ URGENTE (Chamada Imediata)</h4>
                  <p className="text-xs text-slate-400 mt-1">Prestador a caminho em até 45 minutos (+25% no valor).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 3: Resumo & Checkout */}
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sticky top-8 space-y-6">
              <h3 className="text-lg font-bold text-slate-100 border-b border-slate-700 pb-3">Resumo da Ordem</h3>

              {selectedService && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Serviço:</span>
                    <span className="font-semibold text-slate-200 text-right">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valor Base:</span>
                    <span className="font-semibold text-slate-200">R$ {selectedService.basePrice.toFixed(2)}</span>
                  </div>
                  {urgency === 'urgent' && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Taxa de Urgência (25%):</span>
                      <span>R$ {(selectedService.basePrice * 0.25).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-700 pt-3 flex justify-between text-base font-bold">
                    <span>Total Garantido:</span>
                    <span className="text-emerald-400">R$ {totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 text-xs text-slate-400 space-y-1">
                <p>🔒 <span className="font-semibold text-slate-300">Garantia Facilita 90 dias:</span> refazemos o serviço sem custo adicional se houver qualquer problema.</p>
              </div>

              <button
                type="submit"
                disabled={loading || !selectedService}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 font-extrabold rounded-xl text-slate-950 text-base shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Criando Pedido...</span>
                  </>
                ) : (
                  <span>Avançar para Pagamento →</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando...</div>}>
      <NewOrderContent />
    </Suspense>
  );
}

