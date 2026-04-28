'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, CreditCard, CheckCircle, ShieldCheck } from 'lucide-react'

interface PaymentButtonProps {
  orderId: string
  amount: number
}

export function PaymentButton({ orderId, amount }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handlePayment = async () => {
    setIsLoading(true)
    
    try {
      // 1. Iniciar o checkout no backend para registrar a transação
      const checkoutRes = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const checkoutData = await checkoutRes.json()
      
      if (!checkoutData.success) {
        throw new Error(checkoutData.error || 'Falha ao iniciar checkout')
      }

      // 2. Simulação de processamento do Gateway (Stripe/Pagar.me)
      // Em produção, aqui abriria o Modal do Gateway ou redirecionaria
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 3. Simular o Webhook de confirmação que o Gateway enviaria ao sistema
      const webhookRes = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transactionId: checkoutData.transactionId,
          status: 'captured',
          gatewayData: { 
            method: 'credit_card', 
            last4: '4242',
            brand: 'visa'
          }
        }),
      })
      const webhookData = await webhookRes.json()
      
      if (webhookData.success) {
        setIsSuccess(true)
        // Refresh para atualizar o status do pedido na tela
        setTimeout(() => {
          router.refresh()
          router.push('/dashboard') // Volta para o dashboard após pagar
        }, 2500)
      } else {
        throw new Error(webhookData.error || 'Erro na confirmação do pagamento')
      }
    } catch (error: any) {
      console.error('Erro no pagamento:', error)
      alert('Erro ao processar pagamento: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="p-8 bg-green-600 rounded-[2rem] text-white text-center shadow-2xl shadow-green-500/20 animate-in zoom-in duration-500">
        <CheckCircle className="h-16 w-16 mx-auto mb-4" />
        <h3 className="text-2xl font-black mb-1">Pagamento Aprovado!</h3>
        <p className="text-sm opacity-90">O profissional será notificado e seu saldo atualizado.</p>
      </div>
    )
  }

  return (
    <Card className="border-none overflow-hidden shadow-2xl rounded-[2rem] bg-white border-t-4 border-t-primary">
      <div className="p-8 bg-primary/5 border-b border-muted">
        <div className="flex justify-between items-center">
            <h4 className="font-black text-xl flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" /> Pagamento Seguro
            </h4>
            <Badge className="bg-green-100 text-green-700 border-none font-black text-[10px] uppercase tracking-tighter">Conexão Criptografada</Badge>
        </div>
      </div>
      
      <div className="p-8 space-y-6">
        <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Valor do Serviço</span>
                <span className="font-bold">R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Proteção do Consumidor</span>
                <span className="font-bold text-green-600">Incluso</span>
            </div>
            <div className="border-t border-dashed pt-4 flex justify-between items-end">
                <span className="font-black text-lg">Total a Pagar</span>
                <div className="text-right">
                    <span className="block text-[10px] text-muted-foreground font-bold uppercase tracking-widest">BRL</span>
                    <span className="font-black text-4xl text-foreground">R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
        </div>
        
        <div className="p-4 rounded-2xl bg-muted/30 flex gap-3 items-start">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
                Seu pagamento fica retido pela <b>Facilita</b> até que você confirme a conclusão total do serviço. Segurança garantida para você e para o profissional.
            </p>
        </div>

        <Button 
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full h-16 bg-black text-white rounded-2xl font-black text-xl hover:bg-black/90 active:scale-95 transition-all shadow-2xl shadow-black/20 mt-2"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Processando...</span>
            </div>
          ) : (
            'Finalizar Pagamento'
          )}
        </Button>
        
        <div className="flex justify-center gap-4 opacity-30 grayscale">
            {/* Mock logos of payment methods */}
            <div className="h-4 w-8 bg-black rounded" />
            <div className="h-4 w-8 bg-black rounded" />
            <div className="h-4 w-8 bg-black rounded" />
        </div>
      </div>
    </Card>
  )
}

import { Badge } from '@/components/ui/badge'
