'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterClientPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Por favor, informe um número de telefone com DDD válido.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // Simula envio de OTP via Twilio
      await new Promise((res) => setTimeout(res, 800));
      setStep(2);
    } catch (err: any) {
      setError('Erro ao enviar código de verificação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Digite o código de 6 dígitos enviado por SMS.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 800));
      setStep(3);
    } catch (err: any) {
      setError('Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !address) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 1000));
      router.push('/new-order');
    } catch (err: any) {
      setError('Falha ao concluir cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-emerald-400">FACILITA</h1>
          <p className="text-slate-400 text-sm mt-1">Crie sua conta de cliente em poucas etapas</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {/* Step 1: Telefone */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Telefone Celular (com DDD)
              </label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-lg tracking-wide"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl text-slate-950 transition-colors shadow-lg shadow-emerald-950/50"
            >
              {loading ? 'Enviando SMS...' : 'Continuar com SMS'}
            </button>
          </form>
        )}

        {/* Step 2: Código OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Código de 6 dígitos enviado por SMS
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-2xl text-center tracking-widest font-mono"
                required
              />
              <p className="text-xs text-slate-400 text-center mt-2">
                Enviado para <span className="text-emerald-400 font-semibold">{phone}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl text-slate-950 transition-colors shadow-lg"
            >
              {loading ? 'Verificando...' : 'Confirmar Código'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs text-slate-400 hover:text-slate-200 text-center underline"
            >
              Alterar número de telefone
            </button>
          </form>
        )}

        {/* Step 3: Dados Pessoais & Endereço */}
        {step === 3 && (
          <form onSubmit={handleFinalizeRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                placeholder="Maria da Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                E-mail
              </label>
              <input
                type="email"
                placeholder="maria@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Endereço de Atendimento Inicial
              </label>
              <input
                type="text"
                placeholder="Rua Augusta, 1000 - Apt 42, Consolação, São Paulo"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl text-slate-950 transition-colors shadow-lg"
            >
              {loading ? 'Criando Conta...' : 'Concluir e Fazer Pedido'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
