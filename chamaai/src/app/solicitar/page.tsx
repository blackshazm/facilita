import React, { Suspense } from 'react'
import { OrderWizard } from '@/components/order/OrderWizard'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { Zap } from 'lucide-react'

export default function SolicitarPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header />
      
      <main className="flex-grow flex flex-col items-center py-10">
        <div className="container px-4 text-center mb-8 space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg mb-4">
            <Zap className="h-7 w-7 fill-current" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Nova Solicitação</h1>
          <p className="text-muted-foreground">Preencha os dados abaixo para receber o match com um especialista.</p>
        </div>

        <Suspense fallback={<div className="h-[400px] w-full flex items-center justify-center">Carregando formulário...</div>}>
          <OrderWizard />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
