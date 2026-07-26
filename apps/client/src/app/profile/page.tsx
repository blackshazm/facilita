'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  const [orders] = useState<OrderSummary[]>(MOCK_ORDERS);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100">Meu Perfil</h1>
            <p className="text-slate-400 text-sm mt-1">Maria da Silva • maria@email.com • (11) 99999-9999</p>
          </div>
          <Link
            href="/new-order"
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl text-slate-950 text-sm transition-colors text-center"
          >
            + Solicitado Novo Serviço
          </Link>
        </header>

        {/* Histórico de Pedidos */}
        <section className="space-y-4">
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
    </div>
  );
}
