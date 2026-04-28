'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, ArrowRight } from 'lucide-react'

const services = [
  { name: 'Troca de Chuveiro', icon: '🚿', slug: 'troca-chuveiro', price: 'A partir de R$ 80' },
  { name: 'Troca de Tomada', icon: '🔌', slug: 'troca-tomada', price: 'A partir de R$ 50' },
  { name: 'Troca de Interruptor', icon: '💡', slug: 'troca-interruptor', price: 'A partir de R$ 50' },
  { name: 'Troca de Disjuntor', icon: '⚡', slug: 'troca-disjuntor', price: 'A partir de R$ 80' },
  { name: 'Instalação de Luminária', icon: '💡', slug: 'instalar-luminaria', price: 'A partir de R$ 60' },
  { name: 'Instalação de Ventilador', icon: '🌀', slug: 'instalar-ventilador', price: 'A partir de R$ 100' },
  { name: 'Mau Contato', icon: '🔧', slug: 'mau-contato', price: 'A partir de R$ 80' },
  { name: 'Diagnóstico de Curto', icon: '🔍', slug: 'diagnostico-curto', price: 'A partir de R$ 100' },
]

export function ServiceCatalog() {
  return (
    <section id="servicos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              O que você precisa hoje?
            </h2>
            <p className="text-muted-foreground text-lg">
              Escolha uma categoria para começar sua solicitação sem burocracia.
            </p>
          </div>
          <Link href="/solicitar">
            <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5">
              Ver catálogo completo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Link key={index} href={`/solicitar?cat=${service.slug}`}>
              <Card className="hover:border-primary/50 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-primary/5">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-3xl group-hover:bg-primary/10 transition-colors">
                    {service.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold group-hover:text-primary transition-colors">{service.name}</h3>
                    <p className="text-xs text-muted-foreground">{service.price}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
