'use client';

import { useState, useEffect } from 'react';
import { Copy, Users, Wallet, CheckCircle } from 'lucide-react';

export default function ReferralPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch user data from backend
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    })
    .then(data => {
      setUser(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching profile:', err);
      setLoading(false);
    });
  }, []);

  const copyToClipboard = () => {
    if (user?.inviteCode) {
      navigator.clipboard.writeText(user.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-emerald-950">
        <div className="animate-pulse text-emerald-600 font-medium">Carregando seu portal de indicações...</div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 dark:bg-emerald-950">
      {/* Header Banner */}
      <div className="w-full bg-emerald-900 px-6 py-12 text-center text-white">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Indique e Ganhe</h1>
        <p className="mx-auto mt-3 max-w-lg text-emerald-100">
          Compartilhe o FACILITA com seus amigos. Quando eles usarem, ambos ganham créditos!
        </p>
      </div>

      <div className="container mx-auto max-w-2xl px-6 py-10">
        <div className="grid gap-6">
          
          {/* Promo Balance Card */}
          <div className="rounded-3xl bg-white p-8 shadow-sm dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800">
             <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-200">
                   <Wallet size={28} />
                </div>
                <div>
                   <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-emerald-400">Saldo Promocional</h3>
                   <p className="text-3xl font-bold text-slate-900 dark:text-white">R$ {(user?.promoBalance || 0).toFixed(2)}</p>
                </div>
             </div>
          </div>

          {/* Invite Code Section */}
          <div className="relative overflow-hidden rounded-3xl bg-emerald-50 p-8 dark:bg-emerald-900/50 border-2 border-dashed border-emerald-200 dark:border-emerald-700">
            <h3 className="mb-6 text-center text-lg font-bold text-emerald-900 dark:text-emerald-50">Seu Código Exclusivo</h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
               <div className="flex-1 w-full rounded-2xl bg-white p-5 text-center shadow-inner dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-800">
                 <span className="text-3xl font-mono font-extrabold tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                   {user?.inviteCode || '------'}
                 </span>
               </div>
               <button 
                onClick={copyToClipboard}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-5 text-white font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
               >
                 {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                 {copied ? 'Copiado!' : 'Copiar'}
               </button>
            </div>
            
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-emerald-100/50 p-4 dark:bg-emerald-800/30">
               <div className="mt-0.5 text-emerald-600 dark:text-emerald-400">⚡</div>
               <p className="text-sm text-emerald-800 dark:text-emerald-200">
                 <strong>Como funciona:</strong> Você e seu amigo ganham <strong>R$ 10,00</strong> cada assim que o indicado completar e pagar seu primeiro serviço na plataforma (após 15 dias).
               </p>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="rounded-3xl bg-white p-8 shadow-sm dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                      <Users size={24} />
                   </div>
                   <div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 dark:text-emerald-500">Amigos que usaram</h3>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{user?.referralCount || 0}</p>
                   </div>
                </div>
                
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Progresso do Limite</span>
                   <div className="mt-1 flex items-center gap-3">
                      <div className="h-2.5 w-32 rounded-full bg-slate-100 dark:bg-emerald-950 overflow-hidden">
                         <div 
                           className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000" 
                           style={{ width: `${Math.min(100, ((user?.referralCount || 0) / (user?.referralLimit || 200)) * 100)}%` }}
                         ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{user?.referralLimit || 200}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-slate-400 dark:text-emerald-600">
            Sujeito aos Termos de Uso e Política Anti-Fraude do FACILITA. 
            O bônus promocional não é resgatável em dinheiro e expira em 90 dias.
          </p>
        </div>
      </div>
    </main>
  );
}
