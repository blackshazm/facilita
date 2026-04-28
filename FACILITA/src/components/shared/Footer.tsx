import React from 'react'
import Link from 'next/link'
import { Zap, Globe, Mail, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/5 pt-16 pb-24 md:pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <span className="text-xl font-black tracking-tighter text-foreground uppercase">
                FACILITA
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A maior infraestrutura de tecnologia para serviços elétricos do Brasil. 
              Conectamos você aos melhores profissionais com segurança e garantia.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-background border hover:border-primary transition-colors">
                <Globe className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6">Plataforma</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#como-funciona" className="hover:text-primary">Como funciona</Link></li>
              <li><Link href="#servicos" className="hover:text-primary">Serviços</Link></li>
              <li><Link href="/profissionais" className="hover:text-primary">Profissionais</Link></li>
              <li><Link href="/solicitar" className="hover:text-primary">Solicitar serviço</Link></li>
              <li><Link href="/login" className="hover:text-primary">Área do cliente</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Sou Profissional</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/register-provider" className="hover:text-primary text-primary font-semibold">Seja um parceiro</Link></li>
              <li><Link href="#" className="hover:text-primary">Vantagens FACILITA</Link></li>
              <li><Link href="#" className="hover:text-primary">Central de ajuda</Link></li>
              <li><Link href="/login" className="hover:text-primary">Acessar dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Contato</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                contato@facilita.com.br
              </li>
              <li className="pt-4 text-xs">
                São Paulo - SP<br />
                Atendimento 24h para emergências.
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2026 FACILITA Tecnologia LTDA. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary">Termos de Uso</Link>
            <Link href="#" className="hover:text-primary">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
