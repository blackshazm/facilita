'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Home, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Star, 
  ArrowLeft,
  X
} from 'lucide-react';

export interface UserAddress {
  id: string;
  label: 'CASA' | 'TRABALHO' | 'OUTRO';
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  isDefault: boolean;
}

const DEFAULT_ADDRESSES: UserAddress[] = [
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

interface OrderSummary {
  id: string;
  serviceName: string;
  category: string;
  providerName: string;
  date: string;
  price: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'CANCELED';
  rating?: number;
}

const MOCK_ORDERS: OrderSummary[] = [
  {
    id: 'ord-1024',
    serviceName: 'Instalação de Tomada / Interruptor',
    category: 'Eletricista',
    providerName: 'Carlos Silva',
    date: 'Hoje, 14:30',
    price: 140.0,
    status: 'IN_PROGRESS',
  },
  {
    id: 'ord-1012',
    serviceName: 'Troca de Chuveiro Elétrico',
    category: 'Eletricista',
    providerName: 'Carlos Silva',
    date: '18/07/2026',
    price: 120.0,
    status: 'COMPLETED',
    rating: 5,
  },
  {
    id: 'ord-998',
    serviceName: 'Reparo de Vazamento de Torneira',
    category: 'Encanador',
    providerName: 'Marcos Oliveira',
    date: '05/07/2026',
    price: 110.0,
    status: 'COMPLETED',
    rating: 5,
  },
];

export default function ClientProfilePage() {
  const [addresses, setAddresses] = useState<UserAddress[]>(DEFAULT_ADDRESSES);
  const [orders] = useState<OrderSummary[]>(MOCK_ORDERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form state
  const [formLabel, setFormLabel] = useState<'CASA' | 'TRABALHO' | 'OUTRO'>('CASA');
  const [formStreet, setFormStreet] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formComplement, setFormComplement] = useState('');
  const [formNeighborhood, setFormNeighborhood] = useState('');
  const [formCity, setFormCity] = useState('São Paulo');
  const [formState, setFormState] = useState('SP');
  const [formCep, setFormCep] = useState('');

  // Carrega do localStorage se existir
  useEffect(() => {
    try {
      const stored = localStorage.getItem('facilita_user_addresses');
      if (stored) {
        setAddresses(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const saveToStorage = (list: UserAddress[]) => {
    setAddresses(list);
    try {
      localStorage.setItem('facilita_user_addresses', JSON.stringify(list));
    } catch {}
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStreet || !formNumber || !formNeighborhood) return;

    const newAddr: UserAddress = {
      id: `addr-${Date.now()}`,
      label: formLabel,
      street: formStreet,
      number: formNumber,
      complement: formComplement,
      neighborhood: formNeighborhood,
      city: formCity,
      state: formState,
      cep: formCep || '01000-000',
      isDefault: addresses.length === 0,
    };

    const updated = [newAddr, ...addresses];
    saveToStorage(updated);
    setIsModalOpen(false);

    // Limpa form
    setFormStreet('');
    setFormNumber('');
    setFormComplement('');
    setFormNeighborhood('');
    setFormCep('');

    setNotification('Endereço adicionado com sucesso!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    saveToStorage(updated);
    setNotification('Endereço removido.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map(a => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveToStorage(updated);
    setNotification('Endereço principal atualizado.');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition mb-2"
            >
              <ArrowLeft size={14} /> Voltar para o início
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-100">Meu Perfil</h1>
            <p className="text-slate-400 text-sm mt-1">Maria da Silva • maria@email.com • (11) 99999-9999</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold rounded-xl text-slate-200 text-sm transition-colors text-center"
            >
              Meus Pedidos
            </Link>
            <Link
              href="/new-order"
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl text-slate-950 text-sm transition-colors text-center shadow-lg shadow-emerald-950/40"
            >
              + Solicitar Novo Serviço
            </Link>
          </div>
        </header>

        {notification && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} /> {notification}
          </div>
        )}

        {/* Seção 1: Meus Endereços Salvos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                <MapPin className="text-emerald-400" size={20} /> Meus Endereços Salvos
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Endereços favoritos para agilizar seus chamados de manutenção</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus size={14} /> Novo Endereço
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-3 relative group hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-slate-900 rounded-xl text-emerald-400">
                      {addr.label === 'CASA' ? <Home size={16} /> : addr.label === 'TRABALHO' ? <Briefcase size={16} /> : <MapPin size={16} />}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-white block">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          Principal
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg transition"
                    title="Remover Endereço"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="text-xs text-slate-300 space-y-0.5">
                  <p className="font-semibold text-white">
                    {addr.street}, {addr.number} {addr.complement && `• ${addr.complement}`}
                  </p>
                  <p className="text-slate-400">
                    {addr.neighborhood} — {addr.city}/{addr.state}
                  </p>
                  <p className="text-slate-500 text-[11px]">CEP: {addr.cep}</p>
                </div>

                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 underline text-left pt-1"
                  >
                    Definir como principal
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Seção 2: Histórico de Pedidos */}
        <section className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xl font-bold text-slate-200">Meus Pedidos</h2>

          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-md">
                      {ord.category.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">{ord.date}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100">{ord.serviceName}</h3>
                  <p className="text-xs text-slate-400">
                    Prestador: <span className="text-slate-200 font-semibold">{ord.providerName}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-700/60 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 block">Valor pago</span>
                    <span className="text-lg font-extrabold text-emerald-400">R$ {ord.price.toFixed(2)}</span>
                  </div>

                  {ord.status === 'IN_PROGRESS' ? (
                    <Link
                      href={`/tracking/${ord.id}`}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                    >
                      Acompanhar Vivo →
                    </Link>
                  ) : (
                    <Link
                      href={`/orders/${ord.id}/review`}
                      className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
                    >
                      {ord.rating ? `Avaliado (${ord.rating}★)` : 'Avaliar'}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal de Adicionar Endereço */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin size={20} className="text-emerald-400" /> Cadastrar Novo Endereço
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Identificador</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CASA', 'TRABALHO', 'OUTRO'] as const).map(l => (
                    <button
                      type="button"
                      key={l}
                      onClick={() => setFormLabel(l)}
                      className={`py-2 rounded-xl font-bold border transition ${
                        formLabel === l
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {l === 'CASA' ? '🏠 Casa' : l === 'TRABALHO' ? '💼 Trabalho' : '📍 Outro'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Logradouro / Rua</label>
                  <input
                    type="text"
                    placeholder="Ex: Av. Paulista"
                    value={formStreet}
                    onChange={e => setFormStreet(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Número</label>
                  <input
                    type="text"
                    placeholder="1000"
                    value={formNumber}
                    onChange={e => setFormNumber(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Complemento (Apto, Bloco)</label>
                  <input
                    type="text"
                    placeholder="Apto 42"
                    value={formComplement}
                    onChange={e => setFormComplement(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bairro</label>
                  <input
                    type="text"
                    placeholder="Bela Vista"
                    value={formNeighborhood}
                    onChange={e => setFormNeighborhood(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Cidade</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={e => setFormCity(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">UF</label>
                  <input
                    type="text"
                    value={formState}
                    onChange={e => setFormState(e.target.value)}
                    required
                    maxLength={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">CEP</label>
                <input
                  type="text"
                  placeholder="01310-100"
                  value={formCep}
                  onChange={e => setFormCep(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-emerald-500/20"
                >
                  Salvar Endereço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
