'use client';
import React, { useEffect, useState } from 'react';
import { ServiceCard } from '../components/ServiceCard';

// MOCK Data - No mundo real isso vem do GET /catalog/services
const MOCK_SERVICES = [
  { id: '1', name: 'Instalação de chuveiro', description: 'Troca/instalação de chuveiro elétrico. Não inclui o chuveiro nem fiação nova.', price: 'R$ 120,00', time: '1h' },
  { id: '2', name: 'Troca de torneira elétrica', description: 'Substituição de torneira elétrica. Inclui mão de obra e vedação básica.', price: 'R$ 100,00', time: '45min' },
  { id: '3', name: 'Instalação de ventilador', description: 'Montagem e instalação de ventilador de teto em ponto existente.', price: 'R$ 150,00', time: '1h 30m' },
  { id: '4', name: 'Troca de disjuntor', description: 'Substituição de disjuntor defeituoso no quadro de energia principal.', price: 'R$ 90,00', time: '30min' },
  { id: '5', name: 'Lustre / Luminária', description: 'Instalação de até 3 pontos de luz simples.', price: 'R$ 80,00', time: '45min' },
  { id: '6', name: 'Tomada / Interruptor', description: 'Instalação ou troca de até 3 tomadas ou interruptores.', price: 'R$ 110,00', time: '1h' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-blue-600 text-white px-4 pt-12 pb-6 rounded-b-3xl shadow-sm">
        <h1 className="text-xl font-medium mb-1">Olá, Cliente!</h1>
        <p className="text-blue-100 text-sm">Onde você precisa de ajuda hoje?</p>
      </header>

      {/* Main Content */}
      <main className="px-4 mt-6">
        
        {/* Categories (Tabs) - Somente Elétrica ativo no MVP */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-2 no-scrollbar">
          <button className="px-5 py-2 bg-blue-600 text-white rounded-full font-medium text-sm whitespace-nowrap shadow-sm">
            ⚡ Elétrica
          </button>
          <button className="px-5 py-2 bg-white text-gray-500 rounded-full font-medium text-sm whitespace-nowrap border border-gray-200 opacity-50">
            💧 Hidráulica (Em breve)
          </button>
          <button className="px-5 py-2 bg-white text-gray-500 rounded-full font-medium text-sm whitespace-nowrap border border-gray-200 opacity-50">
            🔨 Reparos (Em breve)
          </button>
        </div>

        {/* Services List */}
        <h2 className="text-lg font-bold text-gray-900 mb-4 mt-2">Serviços Disponíveis</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_SERVICES.map(service => (
            <ServiceCard
              key={service.id}
              name={service.name}
              description={service.description}
              price={service.price}
              time={service.time}
              onSelect={() => alert(`Iniciando triagem para: ${service.name}`)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
