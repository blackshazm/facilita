'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  ArrowLeft, 
  MapPin, 
  Home, 
  Briefcase, 
  Plus, 
  CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';

interface ServiceOption {
  id: string;
  category: string;
  name: string;
  basePrice: number;
  description: string;
}

interface AddressItem {
  id: string;
  label: 'CASA' | 'TRABALHO' | 'OUTRO';
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  isDefault?: boolean;
}

const DEFAULT_ADDRESSES: AddressItem[] = [
  {
    id: 'addr-1',
    label: 'CASA',
    street: 'Av. Paulista',
    number: '1000',
    complement: 'Apto 42',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    cep: '01310-100',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'TRABALHO',
    street: 'Rua Funchal',
    number: '418',
    complement: '10º Andar',
    neighborhood: 'Vila Olímpia',
    city: 'São Paulo',
    state: 'SP',
    cep: '04551-060',
    isDefault: false,
  },
];

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

  // Endereços salvos e seleção
  const [addresses, setAddresses] = useState<AddressItem[]>(DEFAULT_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-1');
  const [isCustomAddress, setIsCustomAddress] = useState(false);
  const [customStreet, setCustomStreet] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [customComplement, setCustomComplement] = useState('');
  const [customNeighborhood, setCustomNeighborhood] = useState('');
  const [customCity, setCustomCity] = useState('São Paulo');
  const [saveCustomToProfile, setSaveCustomToProfile] = useState(true);

  useEffect(() => {
    if (serviceIdParam) {
      const match = SERVICES.find(s => s.id === serviceIdParam);
      if (match) setSelectedService(match);
    }
  }, [serviceIdParam]);

  // Carrega endereços do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('facilita_user_addresses');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddresses(parsed);
          const defaultAddr = parsed.find((a: AddressItem) => a.isDefault) || parsed[0];
          setSelectedAddressId(defaultAddr.id);
        }
      }
    } catch {}
  }, []);

  const totalPrice = selectedService ? (urgency === 'urgent' ? selectedService.basePrice * 1.25 : selectedService.basePrice) : 0;

  // Objeto de endereço ativo formatado
  const activeSelectedAddress = addresses.find(a => a.id === selectedAddressId);
  const formattedAddressText = isCustomAddress 
    ? (customStreet ? `${customStreet}, ${customNumber || 'S/N'} - ${customNeighborhood || 'Centro'}, ${customCity}` : 'Endereço personalizado a preencher')
    : activeSelectedAddress 
      ? `${activeSelectedAddress.street}, ${activeSelectedAddress.number}${activeSelectedAddress.complement ? ` (${activeSelectedAddress.complement})` : ''} - ${activeSelectedAddress.neighborhood}, ${activeSelectedAddress.city}`
      : 'Endereço não selecionado';

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    if (isCustomAddress && (!customStreet || !customNeighborhood)) {
      alert('Por favor, informe a rua e o bairro do atendimento.');
      return;
    }

    setLoading(true);
    const mockOrderId = `ord-${Date.now()}`;
    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `idemp-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Se criou endereço customizado e marcou para salvar, persiste no perfil
    if (isCustomAddress && saveCustomToProfile && customStreet) {
      const newAddr: AddressItem = {
        id: `addr-${Date.now()}`,
        label: 'OUTRO',
        street: customStreet,
        number: customNumber || 'S/N',
        complement: customComplement,
        neighborhood: customNeighborhood,
        city: customCity,
        state: 'SP',
        cep: '01000-000',
        isDefault: false,
      };
      const updatedList = [newAddr, ...addresses];
      try {
        localStorage.setItem('facilita_user_addresses', JSON.stringify(updatedList));
      } catch {}
    }

    // Salva o endereço deste pedido e chave de idempotência para consulta nas próximas etapas
    try {
      localStorage.setItem('facilita_last_order_address', formattedAddressText);
      localStorage.setItem('facilita_order_idempotency_key', idempotencyKey);
    } catch {}

    setTimeout(() => {
      router.push(`/checkout/${mockOrderId}`);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="text-slate-400 hover:text-white transition flex items-center gap-1 text-xs">
                <ArrowLeft size={14} /> Voltar ao início
              </Link>
            </div>
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
            {/* 1. Seleção de Serviço */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">1</span>
                <span>Escolha o Serviço</span>
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
                          ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500'
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

            {/* 2. Endereço do Atendimento */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">2</span>
                  <span>Endereço do Atendimento</span>
                </h2>
                <Link href="/profile" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                  Gerenciar endereços
                </Link>
              </div>

              {/* Lista de Endereços Salvos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="saved-addresses-list">
                {addresses.map((addr) => {
                  const isSelected = !isCustomAddress && selectedAddressId === addr.id;

                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setIsCustomAddress(false);
                        setSelectedAddressId(addr.id);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500'
                          : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {addr.label === 'CASA' ? (
                            <Home size={14} className="text-emerald-400" />
                          ) : addr.label === 'TRABALHO' ? (
                            <Briefcase size={14} className="text-blue-400" />
                          ) : (
                            <MapPin size={14} className="text-purple-400" />
                          )}
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                              Padrão
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-200 line-clamp-1">
                        {addr.street}, {addr.number} {addr.complement && `(${addr.complement})`}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {addr.neighborhood} - {addr.city}/{addr.state}
                      </p>
                    </div>
                  );
                })}

                {/* Opção para informar outro endereço */}
                <div
                  onClick={() => setIsCustomAddress(true)}
                  className={`p-3.5 rounded-xl border border-dashed cursor-pointer transition-all flex items-center justify-center gap-2 ${
                    isCustomAddress
                      ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500 text-emerald-400'
                      : 'border-slate-700 bg-slate-900/60 hover:border-slate-500 text-slate-400'
                  }`}
                  data-testid="btn-custom-address"
                >
                  <Plus size={16} />
                  <span className="text-xs font-bold">Usar outro endereço</span>
                </div>
              </div>

              {/* Formulário de Endereço Personalizado */}
              {isCustomAddress && (
                <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3 animate-in fade-in">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Informar endereço do atendimento
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[11px] text-slate-400 mb-1">Rua / Logradouro *</label>
                      <input
                        type="text"
                        placeholder="Ex: Rua Oscar Freire"
                        value={customStreet}
                        onChange={(e) => setCustomStreet(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        required={isCustomAddress}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Número *</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={customNumber}
                        onChange={(e) => setCustomNumber(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Complemento</label>
                      <input
                        type="text"
                        placeholder="Apto 12B"
                        value={customComplement}
                        onChange={(e) => setCustomComplement(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Bairro *</label>
                      <input
                        type="text"
                        placeholder="Pinheiros"
                        value={customNeighborhood}
                        onChange={(e) => setCustomNeighborhood(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        required={isCustomAddress}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Cidade</label>
                      <input
                        type="text"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="saveToProfile"
                      checked={saveCustomToProfile}
                      onChange={(e) => setSaveCustomToProfile(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="saveToProfile" className="text-xs text-slate-300 cursor-pointer">
                      Salvar este endereço para futuros pedidos
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Detalhes e Fotos */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">3</span>
                <span>Detalhe o problema</span>
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

            {/* 4. Urgência */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">4</span>
                <span>Urgência do Atendimento</span>
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
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-400 text-xs">Serviço:</span>
                    <span className="font-semibold text-slate-200 text-right text-xs max-w-[180px]">{selectedService.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-slate-400 text-xs">Local:</span>
                    <span className="font-medium text-emerald-400 text-right text-xs max-w-[180px] line-clamp-2" data-testid="summary-address">
                      {formattedAddressText}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Valor Base:</span>
                    <span className="font-semibold text-slate-200">R$ {selectedService.basePrice.toFixed(2)}</span>
                  </div>
                  {urgency === 'urgent' && (
                    <div className="flex justify-between text-xs text-emerald-400">
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
