'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Star, Users, Zap } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-16 lg:py-24">
      {/* Background blobs for depth */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 max-w-2xl">
            <div className="space-y-4">
              <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary rounded-full animate-in fade-in slide-in-from-left-4">
                ✨ O Marketplace #1 de Elétrica em SP
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground lg:leading-[1.1]">
                Problemas elétricos? <br />
                <span className="text-primary italic">Chama o especialista</span> em minutos.
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Contrate profissionais verificados para trocar chuveiros, tomadas, 
                diagnóstico de curto e muito mais. Pagamento seguro dentro da plataforma 
                e garantia de 7 dias.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/solicitar">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-primary text-white text-lg font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95">
                  <Zap className="mr-2 h-5 w-5 fill-current" />
                  Solicitar Especialista
                </Button>
              </Link>
              <Link href="/profissionais">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 rounded-2xl border-2 text-lg font-semibold hover:bg-muted/50 transition-all">
                  Ver Profissionais
                </Button>
              </Link>
            </div>

            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">100% Verificado</p>
                  <p className="text-xs text-muted-foreground">KYC e Antecedentes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-600">
                  <Star className="h-6 w-6 fill-current" />
                </div>
                <div>
                  <p className="text-sm font-bold">4.9/5 Estrelas</p>
                  <p className="text-xs text-muted-foreground">Média operacional</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">+5k Atendimentos</p>
                  <p className="text-xs text-muted-foreground">Concluídos com sucesso</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 overflow-hidden rounded-[2rem] shadow-2xl shadow-primary/10 border-4 border-white dark:border-muted rotate-2 aspect-[4/3] lg:aspect-square">
              <Image 
                src="/images/hero.png" 
                alt="Eletricista Profissional ChamaAi" 
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Floating UI Element */}
            <div className="absolute -bottom-6 -left-6 z-20 glass p-5 rounded-2xl shadow-xl border animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary">
                  <Image src="https://i.pravatar.cc/150?u=electrician" alt="Avatar" width={48} height={48} />
                </div>
                <div>
                  <p className="text-sm font-bold">Ricardo S.</p>
                  <div className="flex gap-1 text-yellow-500">
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Eletricista Top Rated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
