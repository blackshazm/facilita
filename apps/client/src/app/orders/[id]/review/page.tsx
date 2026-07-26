'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ReviewOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [rating, setRating] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [technical, setTechnical] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // POST /reviews
      await new Promise((res) => setTimeout(res, 800));
      setSubmitted(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6 shadow-2xl">
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
              ⭐
            </div>
            <h1 className="text-2xl font-bold text-emerald-400">Obrigado pela Avaliação!</h1>
            <p className="text-slate-300 text-sm">
              Sua opinião ajuda a manter os melhores prestadores no Facilita.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-slate-100">Como foi seu atendimento?</h1>
              <p className="text-slate-400 text-sm mt-1">
                Avalie o prestador <span className="text-emerald-400 font-semibold">Carlos Silva</span>
              </p>
            </div>

            {/* Avaliação Geral (5 Estrelas) */}
            <div className="text-center bg-slate-900 border border-slate-700 rounded-xl p-6">
              <span className="text-xs font-semibold text-slate-400 block mb-3 uppercase tracking-wider">
                Nota Geral do Serviço
              </span>
              <div className="flex justify-center gap-2 text-3xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`transition-transform hover:scale-125 ${
                      star <= rating ? 'text-amber-400' : 'text-slate-700'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Critérios Específicos */}
            <div className="space-y-4 bg-slate-900/60 border border-slate-700/50 rounded-xl p-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Pontualidade na Chegada</span>
                <div className="flex gap-1 text-lg">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPunctuality(s)}
                      className={s <= punctuality ? 'text-amber-400' : 'text-slate-700'}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Qualidade Técnica</span>
                <div className="flex gap-1 text-lg">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTechnical(s)}
                      className={s <= technical ? 'text-amber-400' : 'text-slate-700'}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Organização & Limpeza do Local</span>
                <div className="flex gap-1 text-lg">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCleanliness(s)}
                      className={s <= cleanliness ? 'text-amber-400' : 'text-slate-700'}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Comentário Opcional */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Deixe um elogio ou observação (opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Profissional extremamente educado, chegou no horário e deixou tudo limpo!"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 font-extrabold rounded-xl text-slate-950 text-base shadow-lg transition-all"
            >
              {loading ? 'Enviando...' : 'Enviar Avaliação ⭐'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
