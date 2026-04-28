'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FileSearch, CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react'

const steps = [
  {
    title: 'Descreva o problema',
    description: 'Escolha o serviço no catálogo ou descreva o problema. Sem login obrigatório para começar.',
    icon: FileSearch,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'Receba o Match',
    description: 'Encontramos o profissional verificado mais próximo e com melhor score para você.',
    icon: CheckCircle2,
    color: 'bg-green-500/10 text-green-600',
  },
  {
    title: 'Aprove e Pague',
    description: 'Você recebe o orçamento e paga via app. O valor fica seguro enquanto o serviço é feito.',
    icon: CreditCard,
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Serviço Concluído',
    description: 'Profissional realiza o job e envia fotos. Você aprova e pronto! 7 dias de garantia.',
    icon: ShieldCheck,
    color: 'bg-yellow-500/10 text-yellow-600',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Como funciona a FACILITA?
          </h2>
          <p className="text-muted-foreground text-lg">
            Muito mais que um classificado. Nós garantimos a transação de ponta a ponta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="border-none shadow-xl bg-background/50 backdrop-blur-sm relative overflow-hidden group hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 font-black text-6xl opacity-5 group-hover:opacity-10 transition-opacity">
                {index + 1}
              </div>
              <CardContent className="pt-8 pb-10 px-6 text-center space-y-6">
                <div className={`mx-auto h-16 w-16 rounded-2xl flex items-center justify-center ${step.color} shadow-inner`}>
                  <step.icon className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
