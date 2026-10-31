import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Termos de Uso | FACILITA',
  description: 'Termos e Condições Gerais de Uso da Plataforma FACILITA',
};

export default function TermsPage() {
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
              <FileText size={14} /> Documento Legal
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Termos e Condições Gerais de Uso
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Última atualização: 31 de Outubro de 2026 • Versão 2.1
            </p>
          </div>

          <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">1.</span> Objeto e Natureza da Plataforma
            </h2>
            <p>
              A <strong>FACILITA TECNOLOGIA E SERVIÇOS LTDA.</strong> (&ldquo;FACILITA&rdquo;) opera uma plataforma digital
              multiplataforma (web e aplicativos móveis) destinada à intermediação, conexão e facilitação de contratação
              entre usuários demandantes de serviços residenciais e comerciais (&ldquo;Clientes&rdquo;) e profissionais autônomos
              prestadores de serviços técnicos e manuais (&ldquo;Prestadores&rdquo;).
            </p>
            <p>
              A FACILITA <strong>não presta diretamente serviços de eletricidade, hidráulica, pintura ou manutenção</strong>,
              atuando estritamente como provedora de infraestrutura tecnológica, inteligência de matching geográfico,
              processamento seguro de pagamentos e garantia de qualidade.
            </p>
          </section>

          <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">2.</span> Cadastro, Verificação e Segurança (KYC)
            </h2>
            <p>
              O acesso aos serviços exige cadastro prévio e verificação de identidade. Para Prestadores, é obrigatório
              o procedimento de <em>Know Your Customer</em> (KYC), incluindo envio de documento oficial com foto (RG/CNH),
              comprovante de residência e cadastro de chave PIX de titularidade compatível.
            </p>
            <p>
              A FACILITA reserva-se o direito de suspender ou encerrar contas que apresentem documentação inconsistente,
              indícios de fraude ou descumprimento dos padrões de urbanidade e segurança.
            </p>
          </section>

          <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">3.</span> Pagamentos, Custódia e Taxa de Intermediação
            </h2>
            <p>
              Todos os pagamentos referentes aos serviços intermediados são realizados exclusivamente por meio do ambiente
              seguro da plataforma (via PIX ou Cartão de Crédito).
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                <strong>Custódia Segura (Escrow):</strong> O valor do serviço permanece retido com segurança até a
                conclusão satisfatória e confirmação do Cliente.
              </li>
              <li>
                <strong>Taxa de Serviço:</strong> A plataforma retém uma taxa padrão de intermediação de até 15% sobre o
                valor bruto do serviço contratado para custear a tecnologia, garantia e suporte 24/7.
              </li>
              <li>
                <strong>Liquidação e Payouts:</strong> O repasse líquido ao Prestador é creditado via PIX após a
                conclusão do serviço ou nos ciclos diários automáticos de liquidação bancária.
              </li>
            </ul>
          </section>

          <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">4.</span> Garantia FACILITA de 7 Dias
            </h2>
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 text-emerald-200">
              <div className="flex items-center gap-2 font-bold mb-1 text-emerald-400">
                <ShieldCheck size={18} /> Proteção e Garantia ao Cliente
              </div>
              Todos os serviços finalizados contam com cobertura de garantia técnica de 7 (sete) dias corridos contra
              vícios ou defeitos de execução decorrentes da mão de obra prestada, com mediação e suporte prioritário.
            </div>
          </section>

          <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">5.</span> Cancelamentos e Reembolsos
            </h2>
            <p>
              O cancelamento sem custo é garantido ao Cliente caso realizado antes do deslocamento do Prestador
              (&ldquo;A caminho&rdquo;). Cancelamentos posteriores à chegada no endereço poderão incorrer em taxa de visita e
              deslocamento mínimo no valor equivalente a R$ 35,00, repassada integralmente ao profissional.
            </p>
          </section>

          <section className="space-y-4 text-slate-300 leading-relaxed text-sm">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">6.</span> Conduta Antifraude e Mensagens
            </h2>
            <p>
              A troca de contatos telefônicos, e-mails ou incentivo a pagamentos fora do ambiente da plataforma sujeita
              os envolvidos a cancelamento imediato de conta e perda de cobertura da Garantia FACILITA, conforme
              monitoramento automatizado de segurança.
            </p>
          </section>

          <div className="border-t border-slate-800 pt-6 text-xs text-slate-500 space-y-1">
            <p>Em caso de dúvidas legais ou solicitações judiciais, entre em contato com nosso departamento jurídico:</p>
            <p className="text-emerald-400 font-semibold">suporte@facilita.com.br • São Paulo / SP - Brasil</p>
          </div>
        </div>
      </div>
    </div>
  );
}

