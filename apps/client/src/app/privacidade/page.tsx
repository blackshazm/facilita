import Link from 'next/link';
import { ArrowLeft, Lock, Shield, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidade | FACILITA',
  description: 'Política de Privacidade e Proteção de Dados Pessoais (LGPD) da FACILITA',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition mb-8"
        >
          <ArrowLeft size={16} /> Voltar para o início
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="border-b border-slate-800 pb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <Lock size={14} /> Privacidade e LGPD
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Política de Privacidade e Proteção de Dados
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Conforme a Lei Geral de Proteção de Dados Pessoais (Lei Federal nº 13.709/2018 - LGPD)
            </p>
          </div>

          <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">1.</span> Compromisso com a sua Privacidade
            </h2>
            <p>
              A <strong>FACILITA TECNOLOGIA E SERVIÇOS LTDA.</strong> tem como princípio inegociável a segurança e o
              respeito à privacidade dos dados de seus usuários (Clientes e Prestadores). Esta Política descreve de forma
              transparente quais informações coletamos, por quais motivos e como você pode exercer pleno controle sobre elas.
            </p>
          </section>

          <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">2.</span> Dados Coletados e Finalidade
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <h3 className="font-bold text-emerald-400 text-sm mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Dados Cadastrais e Contato
                </h3>
                <p className="text-xs text-slate-400">
                  Nome, CPF/CNPJ, e-mail, número de telefone celular. Finalidade: autenticação via OTP SMS, formalização do
                  contrato de intermediação e emissão de notas fiscais de taxa de serviço.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <h3 className="font-bold text-emerald-400 text-sm mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Geolocalização em Tempo Real
                </h3>
                <p className="text-xs text-slate-400">
                  Coordenadas GPS aproximadas ou exatas (durante o uso do app). Finalidade: cálculo de raio de atendimento,
                  matching com profissionais mais próximos e acompanhamento de rota no LiveMap.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <h3 className="font-bold text-emerald-400 text-sm mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Dados Financeiros e PIX
                </h3>
                <p className="text-xs text-slate-400">
                  Chave PIX e dados bancários de prestadores para repasse de remuneração; tokens criptografados de cartão
                  de crédito (processados diretamente em gateway PCI-DSS de nível bancário).
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <h3 className="font-bold text-emerald-400 text-sm mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Documentos de Identificação (KYC)
                </h3>
                <p className="text-xs text-slate-400">
                  Fotografia de CNH/RG e comprovante de residência de prestadores. Finalidade exclusiva de prevenção a
                  fraudes, auditoria e segurança pessoal dos clientes atendidos.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">3.</span> Compartilhamento de Dados
            </h2>
            <p>
              A FACILITA <strong>nunca comercializa, aluga ou monetiza seus dados pessoais com anunciantes</strong>.
              O compartilhamento ocorre exclusivamente com parceiros estritamente necessários para a prestação dos serviços:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>Prestadores e Clientes mutuamente: dados necessários para localização da residência e contato operacional.</li>
              <li>Instituições de Pagamento parceiras autorizadas pelo Banco Central (para processar cobranças e transferências PIX).</li>
              <li>Órgãos fiscais e tributários para emissão obrigatória de notas fiscais eletrônicas de serviço.</li>
            </ul>
          </section>

          <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">4.</span> Seus Direitos como Titular (Art. 18 da LGPD)
            </h2>
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
              <p className="text-xs text-slate-300">
                Você pode solicitar a qualquer momento, de forma facilitada e gratuita através de nossos canais oficiais:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-400">
                <span>✓ Confirmação da existência de tratamento</span>
                <span>✓ Correção de dados incompletos ou inexatos</span>
                <span>✓ Acesso integral aos seus dados</span>
                <span>✓ Exclusão definitiva de conta e dados pessoais</span>
              </div>
            </div>
          </section>

          <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">5.</span> Retenção, Segurança e Criptografia
            </h2>
            <p>
              Todas as transmissões entre seu navegador/aplicativo e nossos servidores são protegidas por criptografia
              de ponta a ponta (TLS 1.3 / HTTPS). Os dados sensíveis armazenados contam com hashing e controles estritos
              de privilégio mínimo.
            </p>
          </section>

          <div className="border-t border-slate-800 pt-6 text-xs text-slate-500 space-y-1">
            <p>Encarregado pelo Tratamento de Dados Pessoais (DPO):</p>
            <p className="text-emerald-400 font-semibold">privacidade@facilita.com.br • São Paulo / SP - Brasil</p>
          </div>
        </div>
      </div>
    </div>
  );
}

