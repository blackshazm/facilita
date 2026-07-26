'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AdditionalApprovalPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);

  // Mock de dados do adicional solicitado
  const additional = {
    id: 'add-123',
    description: 'Compra de Disjuntor 30A Lorenzetti + 3 metros de fio flexível 6mm na fita isolante',
    amount: 65.0,
    type: 'MATERIAL',
    receiptUrl: 'https://placeholder.co/600x400/064e3b/ffffff?text=NOTA+FISCAL+RESERVA',
  };

  const handleDecision = async (status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      // PUT /orders/:id/additionals/:addId
      await new Promise((res) => setTimeout(res, 800));
      setDecision(status);
      setTimeout(() => {
        router.push(`/tracking/${orderId}`);
      }, 1500);
    } catch (err) {
      alert('Erro ao processar resposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6 text-center shadow-2xl">
        {decision ? (
          <div className="space-y-4 py-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl ${
              decision === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {decision === 'approved' ? '✓' : '✕'}
            </div>
            <h1 className={`text-2xl font-bold ${decision === 'approved' ? 'text-emerald-400' : 'text-red-400'}`}>
              {decision === 'approved' ? 'Adicional Aprovado!' : 'Adicional Recusado'}
            </h1>
            <p className="text-slate-300 text-sm">
              {decision === 'approved'
                ? 'O valor foi adicionado ao pedido e será faturado na conclusão.'
                : 'O prestador foi notificado da recusa.'}
            </p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              📦
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-slate-100">Solicitação de Adicional</h1>
              <p className="text-slate-400 text-sm mt-1">
                O prestador solicitou a aprovação de um custo adicional para dar continuidade ao atendimento.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 text-left space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                    {additional.type === 'MATERIAL' ? 'Material de Reposição' : 'Serviço Extra'}
                  </span>
                  <h3 className="font-bold text-slate-200 text-sm mt-1">{additional.description}</h3>
                </div>
                <span className="text-xl font-extrabold text-emerald-400 whitespace-nowrap ml-4">
                  + R$ {additional.amount.toFixed(2)}
                </span>
              </div>

              {additional.receiptUrl && (
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Comprovante de Compra Anexado</span>
                  <img
                    src={additional.receiptUrl}
                    alt="Comprovante"
                    className="rounded-lg border border-slate-700 w-full h-32 object-cover"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => handleDecision('rejected')}
                disabled={loading}
                className="py-3.5 bg-slate-900 hover:bg-slate-950 border border-slate-700 font-bold rounded-xl text-slate-300 text-sm transition-colors"
              >
                Recusar Adicional
              </button>

              <button
                onClick={() => handleDecision('approved')}
                disabled={loading}
                className="py-3.5 bg-emerald-500 hover:bg-emerald-600 font-extrabold rounded-xl text-slate-950 text-sm shadow-lg transition-all"
              >
                {loading ? 'Aprovando...' : 'Aprovar + R$ 65,00'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
