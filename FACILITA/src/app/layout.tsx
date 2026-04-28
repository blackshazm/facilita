import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FACILITA - Profissionais Verificados sob Demanda",
    template: "%s | FACILITA"
  },
  description: "Conectando você aos melhores profissionais de serviços domésticos com segurança, garantia e agilidade.",
  keywords: ["serviços", "manutenção", "reparos", "FACILITA", "profissional verificado"],
  authors: [{ name: "FACILITA App" }],
  creator: "FACILITA",
  publisher: "FACILITA",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://facilita.app",
    title: "FACILITA - Profissionais Sob Demanda",
    description: "Sua plataforma definitiva para conectar serviços rápidos com segurança e qualidade.",
    siteName: "FACILITA",
  },
  twitter: {
    card: "summary_large_image",
    title: "FACILITA - Serviços Rápidos",
    description: "Encontre os melhores profissionais agora.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#000000" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { BottomNav } from "@/components/shared/BottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
