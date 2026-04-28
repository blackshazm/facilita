import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { ServiceCatalog } from '@/components/landing/ServiceCatalog'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-grow">
        <HeroSection />
        <HowItWorks />
        <ServiceCatalog />
        
        {/* Final CTA Section */}
        <section className="py-20 bg-primary overflow-hidden relative">
          {/* Decorative background circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-white/5 blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                Pronto para resolver seus problemas elétricos?
              </h2>
              <p className="text-primary-foreground/80 text-xl">
                Não arrisque sua segurança. Chame um especialista FACILITA e durma tranquilo.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/solicitar">
                <Button size="lg" variant="secondary" className="h-16 px-10 rounded-2xl text-xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all">
                  <Zap className="mr-2 h-6 w-6 fill-primary text-primary" />
                  Solicitar Agora
                </Button>
              </Link>
              <Link href="/register-provider">
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl text-xl font-bold border-white text-white hover:bg-white/10 transition-all">
                  Sou Profissional
                </Button>
              </Link>
            </div>
            
            <p className="text-primary-foreground/60 text-sm">
              Atendimento em São Paulo - SP e região metropolitana.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
