'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Wrench, 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Upload, 
  Sparkles,
  MapPin
} from 'lucide-react';

const CATEGORIES = [
  { id: 'eletrica', name: 'Eletricista', icon: '⚡' },
  { id: 'hidraulica', name: 'Encanador / Hidráulica', icon: '💧' },
  { id: 'pintura', name: 'Pintor', icon: '🎨' },
  { id: 'marcenaria', name: 'Marceneiro / Reparos', icon: '🔨' },
  { id: 'ar_condicionado', name: 'Ar-Condicionado', icon: '❄️' },
  { id: 'limpeza', name: 'Limpeza Residencial', icon: '🧹' }
];

export default function ProviderRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Dados Pessoais
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Step 2: Especialidades & Raio
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['eletrica']);
  const [radiusKm, setRadiusKm] = useState('15');

  // Step 3: Dados Bancários PIX
  const [pixType, setPixType] = useState('cpf');
  const [pixKey, setPixKey] = useState('');
  const [bankName, setBankName] = useState('Banco do Brasil (001)');
  const [agency, setAgency] = useState('');
  const [account, setAccount] = useState('');

  // Step 4: Documentos KYC
  const [docFrontName, setDocFrontName] = useState<string | null>(null);
  const [proofAddressName, setProofAddressName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== id));
      }
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cpf || !phone || !email) {
      setError('Por favor, preencha todos os campos pessoais e de contato.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      setError('Selecione pelo menos uma especialidade.');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleNextStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pixKey) {
      setError('Por favor, informe uma Chave PIX válida para recebimento de repasses.');
      return;
    }
    setError(null);
    setStep(4);
  };

  const handleNextStep4 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFrontName) {
      setError('Por favor, faça o upload da foto do RG ou CNH.');
      return;
    }
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep(5);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4 py-12">
      <div className="w-full max-w-2xl bg-slate-800 rounded-3xl p-6 md:p-10 border border-slate-700 shadow-2xl">
        
        {/* Header de Progresso */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Wrench size={14} /> Cadastro de Prestador de Serviço
          </div>
          <h1 className="text-3xl font-extrabold text-white">Seja um Profissional FACILITA</h1>
          <p className="text-slate-400 text-sm mt-1">Receba chamados de clientes na sua região com garantia de pagamento</p>
        </div>

        {/* Indicador de Passos */}
        {step < 5 && (
          <div className="flex items-center justify-between mb-8 px-2 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-700 -z-0 transform -translate-y-1/2"></div>
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all ${
                  step >= s 
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25' 
                    : 'bg-slate-700 text-slate-400 border border-slate-600'
                }`}
              >
                {step > s ? <CheckCircle2 size={20} /> : s}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-950/70 border border-red-500/50 rounded-xl text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {/* Passo 1: Dados Pessoais */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-5">
            <h2 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-3 flex items-center gap-2">
              <FileText className="text-emerald-400" size={20} /> 1. Dados Pessoais & Contato
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Nome Completo</label>
              <input
                type="text"
                placeholder="Ex: João Silva de Andrade"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">CPF ou CNPJ</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">WhatsApp (com DDD)</label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">E-mail Profissional</label>
              <input
                type="email"
                placeholder="joao.silva@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-6"
            >
              Próximo: Especialidades <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* Passo 2: Especialidades & Raio */}
        {step === 2 && (
          <form onSubmit={handleNextStep2} className="space-y-5">
            <h2 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-3 flex items-center gap-2">
              <Wrench className="text-emerald-400" size={20} /> 2. Categorias & Raio de Atuação
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Selecione as especialidades que você atende:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`p-4 rounded-2xl border cursor-pointer text-center transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold shadow-md'
                          : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <span className="text-xs block">{cat.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-emerald-400" /> Raio Máximo de Deslocamento: <span className="text-emerald-400 font-bold">{radiusKm} km</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                className="w-full accent-emerald-500 bg-slate-900 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>5 km (Bairro)</span>
                <span>25 km (Cidade)</span>
                <span>50 km (Região)</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-4 rounded-xl transition"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                Próximo: Dados Bancários <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* Passo 3: Dados Bancários & PIX */}
        {step === 3 && (
          <form onSubmit={handleNextStep3} className="space-y-5">
            <h2 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-3 flex items-center gap-2">
              <CreditCard className="text-emerald-400" size={20} /> 3. Dados Bancários para Recebimento (PIX)
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Tipo de Chave PIX</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'cpf', label: 'CPF/CNPJ' },
                  { id: 'email', label: 'E-mail' },
                  { id: 'phone', label: 'Celular' },
                  { id: 'evp', label: 'Aleatória' }
                ].map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setPixType(type.id)}
                    className={`py-2 text-xs rounded-xl font-bold border transition ${
                      pixType === type.id
                        ? 'border-emerald-500 bg-emerald-950/50 text-emerald-400'
                        : 'border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Chave PIX</label>
              <input
                type="text"
                placeholder="Informe sua chave PIX exata"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Banco</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Agência</label>
                <input
                  type="text"
                  placeholder="0001"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Conta com Dígito</label>
                <input
                  type="text"
                  placeholder="12345-6"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-4 rounded-xl transition"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                Próximo: Documentos KYC <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* Passo 4: Documentos KYC */}
        {step === 4 && (
          <form onSubmit={handleNextStep4} className="space-y-5">
            <h2 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-3 flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={20} /> 4. Validação de Documentos (KYC)
            </h2>

            <p className="text-xs text-slate-400">
              Para garantir a segurança da plataforma e manter o selo de prestador verificado, envie foto legível do seu documento.
            </p>

            <div className="space-y-4">
              {/* Documento de Identidade */}
              <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-4 text-center cursor-pointer hover:border-emerald-500 transition">
                <Upload size={24} className="mx-auto text-emerald-400 mb-2" />
                <span className="text-sm font-bold block text-slate-200">Foto RG ou CNH (Frente e Verso)</span>
                <span className="text-xs text-slate-500 block mt-1">Formato JPG, PNG ou PDF (até 10MB)</span>
                <input
                  type="file"
                  onChange={(e) => setDocFrontName(e.target.files?.[0]?.name || 'documento_frente.jpg')}
                  className="mt-3 text-xs text-slate-400 block mx-auto"
                />
                {docFrontName && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-2 font-semibold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 size={14} /> {docFrontName}
                  </span>
                )}
              </div>

              {/* Comprovante de Residência */}
              <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-4 text-center cursor-pointer hover:border-emerald-500 transition">
                <Upload size={24} className="mx-auto text-emerald-400 mb-2" />
                <span className="text-sm font-bold block text-slate-200">Comprovante de Residência (Últimos 90 dias)</span>
                <input
                  type="file"
                  onChange={(e) => setProofAddressName(e.target.files?.[0]?.name || 'comprovante_residencia.pdf')}
                  className="mt-3 text-xs text-slate-400 block mx-auto"
                />
                {proofAddressName && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-2 font-semibold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 size={14} /> {proofAddressName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-1/3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-4 rounded-xl transition"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {loading ? 'Enviando Documentos...' : 'Concluir Cadastro'} <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* Passo 5: Sucesso & Direcionamento */}
        {step === 5 && (
          <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <Sparkles size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-emerald-400">Cadastro Enviado com Sucesso!</h2>
              <p className="text-slate-300 text-sm mt-2 max-w-md mx-auto">
                Parabéns, <strong className="text-white">{name}</strong>! Seus documentos foram recebidos e estão em processo de validação prioritária.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 text-left text-xs space-y-2 text-slate-400">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Status de Verificação:</span>
                <span className="text-amber-400 font-bold">Em Análise (KYC Pendente)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Especialidade Principal:</span>
                <span className="text-slate-200 font-semibold">Eletricista</span>
              </div>
              <div className="flex justify-between">
                <span>Chave PIX Cadastrada:</span>
                <span className="text-slate-200 font-semibold">{pixKey || 'Cadastrada'}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/provider/dashboard')}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              Ir para o Painel do Prestador
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
