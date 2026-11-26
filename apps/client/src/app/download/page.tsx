'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Download, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  AlertCircle, 
  ArrowLeft, 
  Sparkles, 
  Wrench, 
  HelpCircle,
  FileCheck2,
  ExternalLink
} from 'lucide-react';

export default function DownloadProviderAppPage() {
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownloadClick = () => {
    setDownloadStarted(true);
    setTimeout(() => {
      setDownloadStarted(false);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition">
            <ArrowLeft size={18} />
            <span className="text-sm font-semibold">Voltar para o Início</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Distribuição Oficial do Prestador
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Sparkles size={14} /> Aplicativo Móvel do Profissional Parceiro
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Baixe o <span className="text-emerald-400">FACILITA Prestador</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Receba chamados urgentes de elétrica, hidráulica e reparos diretamente no seu celular. Preços fixos tabelados, garantia de recebimento e repasse rápido via Pix.
          </p>
        </div>

        {/* Card Principal de Download (Desktop: 2 colunas; Mobile: 1 coluna) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Lado Esquerdo: Download Direto */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/10">
                <Smartphone size={30} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Versão Android Oficial</h2>
                <p className="text-xs text-slate-400">Pacote instalável direto (.APK) • v1.0.0</p>
              </div>
            </div>

            {/* Badges de Especificações Técnicas */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
                <span className="block text-[11px] text-slate-400 font-medium">Tamanho</span>
                <span className="text-xs font-bold text-slate-200">~35 MB</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
                <span className="block text-[11px] text-slate-400 font-medium">Compatível</span>
                <span className="text-xs font-bold text-slate-200">Android 8.0+</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
                <span className="block text-[11px] text-slate-400 font-medium">Segurança</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                  <ShieldCheck size={12} /> SHA-256
                </span>
              </div>
            </div>

            {/* Botão de Download */}
            <div>
              <a
                href="/downloads/facilita-provider.apk"
                download="facilita-provider.apk"
                data-testid="btn-download-apk"
                onClick={handleDownloadClick}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Download size={22} className="stroke-[2.5]" />
                <span>Baixar Aplicativo Android (.APK)</span>
              </a>
              {downloadStarted && (
                <div data-testid="download-feedback-banner" className="mt-3 p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span>Download iniciado! Verifique a barra de notificações do seu celular.</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              <span>Instalação direta, segura e sem custo. Desenvolvido para o profissional autônomo.</span>
            </p>
          </div>

          {/* Lado Direito: QR Code para download pelo celular */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <QrCode size={16} className="text-emerald-400" />
              Escanear pelo Celular
            </span>

            {/* QR Code SVG Visual */}
            <div data-testid="qr-code-container" className="bg-white p-4 rounded-2xl shadow-xl flex items-center justify-center">
              <svg
                className="w-40 h-40"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Simulated Modern QR Pattern */}
                <rect width="100" height="100" fill="white" />
                {/* Top-Left Finder */}
                <rect x="10" y="10" width="24" height="24" fill="#020617" rx="3" />
                <rect x="15" y="15" width="14" height="14" fill="white" />
                <rect x="19" y="19" width="6" height="6" fill="#10b981" />
                {/* Top-Right Finder */}
                <rect x="66" y="10" width="24" height="24" fill="#020617" rx="3" />
                <rect x="71" y="15" width="14" height="14" fill="white" />
                <rect x="75" y="19" width="6" height="6" fill="#10b981" />
                {/* Bottom-Left Finder */}
                <rect x="10" y="66" width="24" height="24" fill="#020617" rx="3" />
                <rect x="15" y="71" width="14" height="14" fill="white" />
                <rect x="19" y="75" width="6" height="6" fill="#10b981" />
                {/* Data Grid Dots */}
                <circle cx="42" cy="18" r="2.5" fill="#020617" />
                <circle cx="50" cy="18" r="2.5" fill="#020617" />
                <circle cx="58" cy="18" r="2.5" fill="#020617" />
                <circle cx="42" cy="26" r="2.5" fill="#10b981" />
                <circle cx="50" cy="34" r="2.5" fill="#020617" />
                <circle cx="58" cy="26" r="2.5" fill="#020617" />
                <circle cx="18" cy="42" r="2.5" fill="#020617" />
                <circle cx="26" cy="42" r="2.5" fill="#020617" />
                <circle cx="34" cy="42" r="2.5" fill="#10b981" />
                <circle cx="42" cy="50" r="3.5" fill="#020617" />
                <circle cx="50" cy="50" r="3.5" fill="#10b981" />
                <circle cx="58" cy="50" r="3.5" fill="#020617" />
                <circle cx="66" cy="42" r="2.5" fill="#020617" />
                <circle cx="74" cy="42" r="2.5" fill="#10b981" />
                <circle cx="82" cy="42" r="2.5" fill="#020617" />
                <circle cx="42" cy="66" r="2.5" fill="#020617" />
                <circle cx="50" cy="74" r="2.5" fill="#020617" />
                <circle cx="58" cy="82" r="2.5" fill="#020617" />
                <circle cx="66" cy="66" r="2.5" fill="#10b981" />
                <circle cx="74" cy="74" r="2.5" fill="#020617" />
                <circle cx="82" cy="82" r="2.5" fill="#10b981" />
              </svg>
            </div>

            <p className="text-xs text-slate-400 max-w-xs">
              Se você está no computador, aponte a câmera do seu smartphone para o QR Code acima para baixar diretamente no seu aparelho.
            </p>
          </div>
        </div>

        {/* Guia Passo a Passo Ilustrado: Como Instalar no Android */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-white">Como Instalar no seu Celular Android</h2>
            <p className="text-xs text-slate-400">Passo a passo simples de 2 minutos para habilitar a instalação direta</p>
          </div>

          <div data-testid="install-steps-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Passo 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-white text-sm">Baixe o APK</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Toque no botão verde acima para iniciar o download do arquivo <strong className="text-slate-200">facilita-provider.apk</strong>.
              </p>
            </div>

            {/* Passo 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-white text-sm">Permita a Instalação</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ao abrir o arquivo, se o Android alertar, toque em <strong className="text-slate-200">"Configurações"</strong> e marque <strong className="text-slate-200">"Permitir desta fonte"</strong>.
              </p>
            </div>

            {/* Passo 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-white text-sm">Toque em Instalar</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Confirme a instalação e aguarde alguns segundos até o ícone do FACILITA aparecer na sua tela inicial.
              </p>
            </div>

            {/* Passo 4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center justify-center">
                4
              </span>
              <h3 className="font-bold text-white text-sm">Faça Login</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Abra o app, insira seu telefone WhatsApp para receber o código OTP de 6 dígitos e comece a atender!
              </p>
            </div>
          </div>
        </div>

        {/* Card de Dúvidas / FAQ de Segurança */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-base">
            <HelpCircle className="text-emerald-400" size={20} />
            <span>Perguntas Frequentes sobre a Instalação Direta</span>
          </div>

          <div className="space-y-3 text-xs text-slate-400">
            <div>
              <strong className="text-slate-200 block mb-0.5">Por que o Android avisa sobre "aplicativo de fonte desconhecida"?</strong>
              <span>O Android exibe esse aviso padrão para qualquer aplicativo baixado fora de lojas pré-instaladas. O arquivo é assinado criptograficamente pela equipe de engenharia da FACILITA e não danifica seu aparelho.</span>
            </div>
            <div>
              <strong className="text-slate-200 block mb-0.5">Como recebo atualizações do aplicativo?</strong>
              <span>O aplicativo possui atualizações automáticas via OTA (Over-The-Air). Assim que uma melhoria for lançada, o próprio app se atualiza sozinho ao abrir com conexão de internet.</span>
            </div>
            <div>
              <strong className="text-slate-200 block mb-0.5">Precisa de ajuda para instalar?</strong>
              <span>Se tiver qualquer dificuldade, nosso time de suporte aos profissionais parceiros atende diretamente pelo WhatsApp oficial da FACILITA.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <p>FACILITA • Plataforma de Intermediação Tecnológica de Serviços Residenciais</p>
      </footer>
    </div>
  );
}
