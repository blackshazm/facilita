'use client';
import React, { useEffect, useState } from 'react';
import { Search, CheckCircle2, Star } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CheckoutPage() {
  const [isSearching, setIsSearching] = useState(true);
  const params = useParams();

  useEffect(() => {
    const timer = setTimeout(() => setIsSearching(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 transition-all duration-500 ease-in-out">
      {isSearching ? (
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center transform transition-all duration-300">
          <div className="relative mb-8 mt-4">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-blue-50 text-blue-600 p-6 rounded-full shadow-inner">
              <Search size={32} className="animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3 text-center">Buscando o melhor prestador...</h1>
          <p className="text-center text-gray-500 text-sm leading-relaxed max-w-[250px]">
            Estamos enviando sua solicitação para os melhores eletricistas disponíveis na sua região.
          </p>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-green-100 flex flex-col items-center transform transition-all duration-500 animate-in fade-in zoom-in-95">
          <div className="mb-6 mt-2">
            <CheckCircle2 size={64} className="text-green-500 animate-bounce" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Prestador Encontrado!</h1>
          <p className="text-center text-gray-500 text-sm mb-8">
            João aceitou o seu serviço e já foi notificado.
          </p>
          
          <div className="w-full bg-gray-50 p-5 rounded-xl flex items-center gap-5 border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold shadow-inner">
              JS
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">João Silva</p>
              <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="font-medium text-gray-700">4.9</span>
                <span>(120 serviços)</span>
              </div>
            </div>
          </div>
          
          <Link href={`/tracking/${params?.id || '1'}`} className="w-full mt-8">
            <button className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100">
              Acompanhar Deslocamento
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
