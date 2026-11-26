'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Star, 
  ArrowLeft, 
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  X,
  Search
} from 'lucide-react';

export interface OrderItem {
  id: string;
  serviceName: string;
  category: string;
  providerName: string;
  providerRating: number;
  date: string;
  createdAt: string;
  price: number;
  status: 'PENDING' | 'MATCHED' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';
  address: string;
  warrantyValidUntil: string;
  hasReview: boolean;
}

interface ReceiptData {
  receiptNumber: string;
  orderId: string;
  serviceTitle: string;
  category: string;
  customerName: string;
  providerName: string;
  date: string;
  paymentMethod: string;
  breakdown: {
    serviceGross: number;
    platformFee: number;
    providerNet: number;
    taxes: number;
    total: number;
  };
  warrantyUntil: string;
  securityHash: string;
}

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord-1024',
    serviceName: 'Instalação de Tomada / Interruptor',
    category: 'Eletricista',
    providerName: 'Carlos Silva',
    providerRating: 4.9,
    date: 'Hoje, 14:30',
    createdAt: new Date().toISOString(),
    price: 140.0,
    status: 'IN_PROGRESS',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo/SP',
    warrantyValidUntil: '2026-11-20',
    hasReview: false,
  },
  {
    id: 'ord-1012',
    serviceName: 'Troca de Chuveiro Elétrico',
    category: 'Eletricista',
    providerName: 'Carlos Silva',
    providerRating: 4.9,
    date: '18/10/2026',
    createdAt: '2026-10-18T10:15:00.000Z',
    price: 120.0,
    status: 'DONE',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo/SP',
    warrantyValidUntil: '2027-01-16',
    hasReview: true,
  },
  {
    id: 'ord-998',
    serviceName: 'Reparo de Vazamento de Torneira/Sifão',
    category: 'Encanador',
    providerName: 'Marcos Oliveira',
    providerRating: 4.8,
    date: '05/10/2026',
    createdAt: '2026-10-05T09:00:00.000Z',
    price: 110.0,
    status: 'DONE',
    address: 'Rua Funchal, 418 - Vila Olímpia, São Paulo/SP',
    warrantyValidUntil: '2027-01-03',
    hasReview: true,
  },
  {
    id: 'ord-940',
    serviceName: 'Desentupimento de Pia ou Vaso',
    category: 'Encanador',
    providerName: 'Prestador não alocado',
    providerRating: 5.0,
    date: '12/09/2026',
    createdAt: '2026-09-12T16:20:00.000Z',
    price: 150.0,
    status: 'CANCELED',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo/SP',
    warrantyValidUntil: '',
    hasReview: false,
  },
];

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'IN_PROGRESS' | 'DONE' | 'CANCELED'>('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [warrantyModalOrder, setWarrantyModalOrder] = useState<OrderItem | null>(null);
  const [warrantyReason, setWarrantyReason] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Tenta sincronizar pedidos ou endereço recente do localStorage
  useEffect(() => {
    try {
      const storedLastAddress = localStorage.getItem('facilita_last_order_address');
      if (storedLastAddress && orders[0]) {
        // Atualiza endereço do pedido mais recente com a seleção feita no checkout
        setOrders(prev => [
          { ...prev[0], address: storedLastAddress },
          ...prev.slice(1),
        ]);
      }
    } catch {}
  }, []);

  const filteredOrders = orders.filter((order) => {
    // Filtro por tab
    if (activeFilter === 'IN_PROGRESS' && order.status !== 'IN_PROGRESS' && order.status !== 'MATCHED' && order.status !== 'PENDING') {
      return false;
    }
    if (activeFilter === 'DONE' && order.status !== 'DONE') {
      return false;
    }
    if (activeFilter === 'CANCELED' && order.status !== 'CANCELED') {
      return false;
    }

    // Filtro por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        order.serviceName.toLowerCase().includes(query) ||
        order.providerName.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleOpenReceipt = (order: OrderItem) => {
    const gross = order.price;
    // Regra Canônica v4.1: Comissão unificada em 20%
    const fee = Number((gross * 0.20).toFixed(2));
    const net = Number((gross - fee).toFixed(2));
    const taxes = Number((gross * 0.05).toFixed(2));

    const receipt: ReceiptData = {
      receiptNumber: `REC-${order.id.replace('ord-', '').toUpperCase()}-2026`,
      orderId: order.id,
      serviceTitle: order.serviceName,
      category: order.category,
      customerName: 'Maria Oliveira (Cliente Verificada)',
      providerName: order.providerName,
      date: order.date,
      paymentMethod: 'PIX Instantâneo (Liquidação Garantida)',
      breakdown: {
        serviceGross: gross,
        platformFee: fee,
        providerNet: net,
        taxes: taxes,
        total: gross,
      },
      warrantyUntil: order.warrantyValidUntil || '90 dias após conclusão',
      securityHash: `FAC-${order.id.toUpperCase()}-E3B0C44298FC1C149AFBF4C8996FB924`,
    };

    setSelectedReceipt(receipt);
  };

  const handleClaimWarranty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warrantyReason || !warrantyModalOrder) return;

    setNotification(`Garantia acionada para o pedido #${warrantyModalOrder.id}. Nossa equipe entrará em contato em até 24h.`);
    setWarrantyModalOrder(null);
    setWarrantyReason('');

    setTimeout(() => setNotification(null), 5000);
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      {/* Notificação flutuante */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="text-slate-400 hover:text-white transition flex items-center gap-1 text-xs">
                <ArrowLeft size={14} /> Início
              </Link>
              <span className="text-slate-600">•</span>
              <Link href="/profile" className="text-slate-400 hover:text-white transition text-xs">
                Meu Perfil
              </Link>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Histórico de Pedidos</h1>
            <p className="text-slate-400 text-xs mt-1">
              Acompanhe atendimentos, emita comprovantes fiscais e acione a garantia de 90 dias
            </p>
          </div>

          <Link href="/new-order">
            <button className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg flex items-center gap-1.5 cursor-pointer">
              <span>+ Novo Pedido</span>
            </button>
          </Link>
        </div>

        {/* Filtros e Barra de Pesquisa */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0" data-testid="orders-filter-tabs">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setActiveFilter('IN_PROGRESS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'IN_PROGRESS'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Em Andamento
            </button>
            <button
              onClick={() => setActiveFilter('DONE')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'DONE'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Concluídos
            </button>
            <button
              onClick={() => setActiveFilter('CANCELED')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'CANCELED'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Cancelados
            </button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por serviço ou ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4" data-testid="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <FileText size={40} className="mx-auto text-slate-600" />
              <h3 className="text-base font-bold text-white">Nenhum pedido encontrado</h3>
              <p className="text-xs max-w-sm mx-auto">
                Não há ordens de serviço correspondentes aos filtros selecionados.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isDone = order.status === 'DONE';
              const isInProgress = order.status === 'IN_PROGRESS' || order.status === 'MATCHED';
              const isCanceled = order.status === 'CANCELED';

              return (
                <div
                  key={order.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg space-y-4"
                  data-testid={`order-card-${order.id}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{order.id}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{order.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isInProgress && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Clock size={12} className="animate-spin" /> Em Execução
                        </span>
                      )}
                      {isDone && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 size={12} /> Concluído
                        </span>
                      )}
                      {isCanceled && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <XCircle size={12} /> Cancelado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        {order.category}
                      </span>
                      <h3 className="text-base font-bold text-white">{order.serviceName}</h3>
                      <p className="text-xs text-slate-400">
                        📍 {order.address}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-xs text-slate-300">
                        <span>Prestador: <strong className="text-white">{order.providerName}</strong></span>
                        {order.providerRating > 0 && (
                          <span className="flex items-center gap-0.5 text-amber-400 text-xs">
                            <Star size={12} className="fill-amber-400" />
                            {order.providerRating}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-left md:text-right flex flex-col md:items-end justify-between gap-2 border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0">
                      <div>
                        <span className="text-xs text-slate-400 block">Total Pago</span>
                        <span className="text-xl font-extrabold text-emerald-400">
                          R$ {order.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Botões de Ação por Card */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* Botão de Comprovante / Recibo Oficial */}
                        <button
                          onClick={() => handleOpenReceipt(order)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          data-testid={`btn-receipt-${order.id}`}
                        >
                          <FileText size={13} className="text-emerald-400" />
                          <span>Recibo / Comprovante</span>
                        </button>

                        {/* Se estiver em andamento, link para tracking */}
                        {isInProgress && (
                          <Link href={`/tracking/${order.id}`}>
                            <button className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition flex items-center gap-1 cursor-pointer">
                              <span>Acompanhar</span>
                              <ChevronRight size={14} />
                            </button>
                          </Link>
                        )}

                        {/* Se concluído, link para avaliar ou acionar garantia */}
                        {isDone && (
                          <>
                            <button
                              onClick={() => setWarrantyModalOrder(order)}
                              className="px-3 py-1.5 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800/50 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <ShieldCheck size={13} className="text-blue-400" />
                              <span>Garantia 90d</span>
                            </button>

                            <Link href={`/orders/${order.id}/review`}>
                              <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer">
                                <Star size={13} className="text-amber-400" />
                                <span>{order.hasReview ? 'Ver Avaliação' : 'Avaliar'}</span>
                              </button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL DE RECIBO / COMPROVANTE OFICIAL FISCAL                  */}
      {/* ============================================================ */}
      {selectedReceipt && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          data-testid="receipt-modal"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
            {/* Header do Comprovante */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 print:border-black">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-sm">
                    F
                  </div>
                  <h2 className="text-lg font-black tracking-tight text-white print:text-black">
                    FACILITA TECNOLOGIA E SERVIÇOS LTDA
                  </h2>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 print:text-gray-600">
                  CNPJ: 48.123.456/0001-99 • Av. Paulista, 1000 - Bela Vista, São Paulo - SP
                </p>
                <p className="text-[11px] font-mono font-bold text-emerald-400 mt-0.5 print:text-black">
                  {selectedReceipt.receiptNumber}
                </p>
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition print:hidden cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Dados do Cliente e Prestador */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800 print:bg-gray-100 print:text-black print:border-gray-300">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5 print:text-gray-600">
                  Tomador (Cliente)
                </span>
                <p className="font-bold text-white print:text-black">{selectedReceipt.customerName}</p>
                <p className="text-[11px] text-slate-400 print:text-gray-600">Liquidado via {selectedReceipt.paymentMethod}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5 print:text-gray-600">
                  Prestador Especialista
                </span>
                <p className="font-bold text-white print:text-black">{selectedReceipt.providerName}</p>
                <p className="text-[11px] text-slate-400 print:text-gray-600">Autônomo Certificado • Nota Fiscal MEI</p>
              </div>
            </div>

            {/* Discriminação dos Valores do Serviço */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1.5 print:text-black print:border-black">
                Discriminação dos Serviços e Retenções
              </h4>

              <div className="flex justify-between py-1">
                <span className="text-slate-300 print:text-black">{selectedReceipt.serviceTitle} ({selectedReceipt.category})</span>
                <span className="font-mono font-bold text-white print:text-black">R$ {selectedReceipt.breakdown.serviceGross.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 text-slate-400 text-[11px] print:text-gray-700">
                <span>Taxa de Intermediação da Plataforma (20%)</span>
                <span className="font-mono">R$ {selectedReceipt.breakdown.platformFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 text-slate-400 text-[11px] print:text-gray-700">
                <span>Retenção Tributária de Serviços (IBS / CBS estimado 5%)</span>
                <span className="font-mono">R$ {selectedReceipt.breakdown.taxes.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 border-t border-slate-800 text-sm font-bold print:border-black">
                <span className="text-white print:text-black">TOTAL PAGO PELO CLIENTE:</span>
                <span className="font-mono text-emerald-400 print:text-black">R$ {selectedReceipt.breakdown.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Selo de Garantia Legal de 90 dias */}
            <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-2xl flex items-center gap-3 print:border-green-700 print:bg-green-50">
              <ShieldCheck size={28} className="text-emerald-400 shrink-0 print:text-green-800" />
              <div>
                <p className="text-xs font-bold text-emerald-300 print:text-green-900">
                  Garantia Legal de Satisfação Facilita (90 Dias — CDC Art. 26)
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5 print:text-gray-700">
                  Válida até <strong className="text-white print:text-black">{selectedReceipt.warrantyUntil}</strong>. Política de reexecução gratuita e conformidade técnica.
                </p>
              </div>
            </div>

            {/* Código de Autenticidade Digital */}
            <div className="text-[10px] text-slate-500 font-mono space-y-0.5 print:text-gray-500">
              <p>Autenticação Digital SHA-256:</p>
              <p className="break-all text-[9px] text-slate-400 print:text-gray-600">{selectedReceipt.securityHash}</p>
            </div>

            {/* Ações do Modal */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={printReceipt}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Printer size={14} />
                <span>Imprimir / Salvar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE ACIONAR GARANTIA DE 90 DIAS                         */}
      {/* ============================================================ */}
      {warrantyModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-400" />
                <h3 className="font-bold text-white text-base">Acionar Garantia Facilita 90d</h3>
              </div>
              <button
                onClick={() => setWarrantyModalOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Serviço: <strong className="text-slate-200">{warrantyModalOrder.serviceName}</strong> (#{warrantyModalOrder.id})
            </p>

            <form onSubmit={handleClaimWarranty} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Descreva o que ocorreu com o reparo:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ex: A tomada instalada voltou a apresentar mau contato após 2 semanas..."
                  value={warrantyReason}
                  onChange={(e) => setWarrantyReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-950/30 border border-blue-800/40 p-3 rounded-xl text-[11px] text-blue-300">
                🛡️ Sem custos adicionais. Um novo técnico será enviado ou o valor será estornado caso o problema persista.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWarrantyModalOrder(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
                >
                  Confirmar Abertura de Garantia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

