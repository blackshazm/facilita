'use client';
import React, { useState } from 'react';
import { MapPin, Wrench, CheckCircle, PhoneCall, Star } from 'lucide-react';

export default function TrackingPage() {
  const [jobStatus, setJobStatus] = useState<'A Caminho' | 'Em Andamento' | 'Concluído'>('A Caminho');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-900 mx-auto">Acompanhar Serviço</h1>
      </header>

      <main className="px-4 mt-6 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-5 mb-5">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold shadow-inner">
              JS
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">João Silva</h2>
              <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                <span>Eletricista</span> • <Star size={14} className="text-yellow-400 fill-current" /> <span className="font-medium">4.9</span>
              </div>
            </div>
            <a href="tel:000" className="ml-auto bg-green-50 hover:bg-green-100 active:bg-green-200 text-green-600 p-3 rounded-full transition-colors shadow-sm">
              <PhoneCall size={20} />
            </a>
          </div>

          <h3 className="font-bold text-gray-800 mb-6 text-center text-lg">Status do Pedido</h3>
          
          <div className="flex flex-col gap-0 px-4">
            {/* Step 1 */}
            <div className={`flex items-center gap-4 transition-all duration-300 ${jobStatus === 'A Caminho' ? 'opacity-100 scale-105' : 'opacity-60'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${jobStatus === 'A Caminho' || jobStatus === 'Em Andamento' || jobStatus === 'Concluído' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <MapPin size={20} className={jobStatus === 'A Caminho' ? 'animate-bounce' : ''} />
              </div>
              <span className={`font-bold text-lg ${jobStatus === 'A Caminho' ? 'text-blue-600' : 'text-gray-700'}`}>Prestador a caminho</span>
            </div>
            
            <div className={`w-0.5 h-8 ml-5 transition-colors duration-500 ${jobStatus === 'Em Andamento' || jobStatus === 'Concluído' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            
            {/* Step 2 */}
            <div className={`flex items-center gap-4 transition-all duration-300 ${jobStatus === 'Em Andamento' ? 'opacity-100 scale-105' : 'opacity-60'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${jobStatus === 'Em Andamento' || jobStatus === 'Concluído' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <Wrench size={20} className={jobStatus === 'Em Andamento' ? 'animate-spin-slow' : ''} />
              </div>
              <span className={`font-bold text-lg ${jobStatus === 'Em Andamento' ? 'text-blue-600' : 'text-gray-700'}`}>Serviço em andamento</span>
            </div>
            
            <div className={`w-0.5 h-8 ml-5 transition-colors duration-500 ${jobStatus === 'Concluído' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            
            {/* Step 3 */}
            <div className={`flex items-center gap-4 transition-all duration-300 ${jobStatus === 'Concluído' ? 'opacity-100 scale-105' : 'opacity-60'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${jobStatus === 'Concluído' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <CheckCircle size={20} className={jobStatus === 'Concluído' ? 'animate-pulse' : ''} />
              </div>
              <span className={`font-bold text-lg ${jobStatus === 'Concluído' ? 'text-green-600' : 'text-gray-700'}`}>Serviço concluído</span>
            </div>
          </div>
        </div>

        {/* Temporary buttons for demo */}
        <div className="mt-10 bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3">Controles de Demonstração</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => setJobStatus('A Caminho')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-sm font-medium transition-colors">A Caminho</button>
            <button onClick={() => setJobStatus('Em Andamento')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-sm font-medium transition-colors">Iniciou</button>
            <button onClick={() => setJobStatus('Concluído')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-sm font-medium transition-colors">Fim</button>
          </div>
        </div>
      </main>
    </div>
  );
}
