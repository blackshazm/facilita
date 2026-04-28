'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Zap, 
  MapPin, 
  Phone, 
  User, 
  Camera, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react'
import Image from 'next/image'

// Types
type Step = 'category' | 'details' | 'photos' | 'location' | 'contact' | 'review'

const categories = [
  { id: '1', name: 'Troca de Chuveiro', slug: 'troca-chuveiro', icon: '🚿' },
  { id: '2', name: 'Troca de Tomada', slug: 'troca-tomada', icon: '🔌' },
  { id: '3', name: 'Troca de Interruptor', slug: 'troca-interruptor', icon: '💡' },
  { id: '4', name: 'Troca de Disjuntor', slug: 'troca-disjuntor', icon: '⚡' },
  { id: '5', name: 'Instalação de Luminária', slug: 'instalar-luminaria', icon: '💡' },
  { id: '6', name: 'Instalação de Ventilador', slug: 'instalar-ventilador', icon: '🌀' },
  { id: '7', name: 'Mau Contato', slug: 'mau-contato', icon: '🔧' },
  { id: '8', name: 'Diagnóstico de Curto', slug: 'diagnostico-curto', icon: '🔍' },
]

export function OrderWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCat = searchParams?.get('cat') || ''

  const [step, setStep] = useState<Step>('category')
  const [formData, setFormData] = useState({
    category: initialCat,
    description: '',
    urgency: 'normal',
    photos: [] as string[],
    city: 'São Paulo',
    neighborhood: '',
    address: '',
    clientName: '',
    clientPhone: '',
  })

  // Handlers
  const nextStep = () => {
    if (step === 'category') setStep('details')
    else if (step === 'details') setStep('photos')
    else if (step === 'photos') setStep('location')
    else if (step === 'location') setStep('contact')
    else if (step === 'contact') setStep('review')
  }

  const prevStep = () => {
    if (step === 'review') setStep('contact')
    else if (step === 'contact') setStep('location')
    else if (step === 'location') setStep('photos')
    else if (step === 'photos') setStep('details')
    else if (step === 'details') setStep('category')
  }

  const handleFinish = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Redirect to the newly created order tracking page
        router.push(`/dashboard/orders/${result.orderId}`)
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      alert('Erro ao enviar pedido: ' + error.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto w-full py-8 px-4">
      {/* Progress Bar */}
      <div className="flex justify-between mb-8 overflow-x-auto pb-4 scrollbar-hide">
        {['category', 'details', 'photos', 'location', 'contact'].map((s, idx) => (
          <div key={s} className="flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === s ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 
              idx < ['category', 'details', 'photos', 'location', 'contact'].indexOf(step) ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {idx < ['category', 'details', 'photos', 'location', 'contact'].indexOf(step) ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
            </div>
            {idx < 4 && <div className={`h-1 w-8 sm:w-12 mx-2 rounded-full ${idx < ['category', 'details', 'photos', 'location', 'contact'].indexOf(step) ? 'bg-green-500' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <Card className="border-none shadow-2xl glass overflow-hidden">
        {step === 'category' && (
          <>
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-2xl font-bold">Qual serviço você precisa?</CardTitle>
              <CardDescription>Selecione uma categoria para começar.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div 
                  key={cat.slug}
                  onClick={() => { setFormData({...formData, category: cat.slug}); nextStep(); }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 hover:border-primary/50 group ${
                    formData.category === cat.slug ? 'border-primary bg-primary/5 shadow-inner' : 'border-transparent bg-muted/50'
                  }`}
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="font-bold text-center text-sm">{cat.name}</span>
                </div>
              ))}
            </CardContent>
          </>
        )}

        {step === 'details' && (
          <>
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-2xl font-bold">Detalhes do Problema</CardTitle>
              <CardDescription>Conte-nos o que está acontecendo com mais detalhes.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Nível de Urgência
                </label>
                <Tabs value={formData.urgency} onValueChange={(v) => setFormData({...formData, urgency: v})} className="w-full">
                  <TabsList className="grid grid-cols-3 w-full h-12 bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="normal" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Normal</TabsTrigger>
                    <TabsTrigger value="urgent" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Urgente</TabsTrigger>
                    <TabsTrigger value="emergency" className="rounded-lg data-[state=active]:bg-red-500 data-[state=active]:text-white">Emergência</TabsTrigger>
                  </TabsList>
                </Tabs>
                {formData.urgency === 'emergency' && (
                  <p className="text-[10px] text-red-500 font-bold uppercase flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" /> Prioridade máxima na triagem
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Descrição do Problema</label>
                <Textarea 
                  placeholder="Ex: Minha tomada do quarto parou de funcionar e senti um cheiro de queimado..."
                  className="min-h-[120px] rounded-xl border-2 focus-visible:ring-primary"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="ghost" onClick={prevStep}>Voltar</Button>
              <Button onClick={nextStep} disabled={!formData.description} className="rounded-xl px-8">Continuar</Button>
            </CardFooter>
          </>
        )}

        {step === 'photos' && (
          <>
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-2xl font-bold text-center">Fotos da evidência</CardTitle>
              <CardDescription className="text-center">Fotos ajudam o profissional a dar um orçamento mais preciso. <br />(Opcional)</CardDescription>
            </CardHeader>
            <CardContent className="pt-10 pb-10 flex flex-col items-center gap-6">
              <div className="h-40 w-40 rounded-full bg-primary/10 flex items-center justify-center border-4 border-dashed border-primary/30 relative cursor-pointer hover:bg-primary/20 transition-all group">
                <Camera className="h-12 w-12 text-primary group-hover:scale-110 transition-transform" />
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" multiple accept="image/*" />
              </div>
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Toque para abrir a câmera ou galeria. Você pode adicionar até 4 fotos.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="ghost" onClick={prevStep}>Voltar</Button>
              <Button onClick={nextStep} className="rounded-xl px-8">Continuar</Button>
            </CardFooter>
          </>
        )}

        {step === 'location' && (
          <>
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-2xl font-bold">Onde você está?</CardTitle>
              <CardDescription>O atendimento está disponível apenas em São Paulo.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Bairro
                </label>
                <Input 
                  placeholder="Ex: Pinheiros"
                  className="h-12 rounded-xl border-2"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Endereço (Rua e número)</label>
                <Input 
                  placeholder="Rua Exemplo, 123"
                  className="h-12 rounded-xl border-2"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="ghost" onClick={prevStep}>Voltar</Button>
              <Button onClick={nextStep} disabled={!formData.neighborhood || !formData.address} className="rounded-xl px-8">Continuar</Button>
            </CardFooter>
          </>
        )}

        {step === 'contact' && (
          <>
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-2xl font-bold font-bold">Identificação rápida</CardTitle>
              <CardDescription>Não precisa de senha. Usaremos esses dados para o match.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Nome completo
                </label>
                <Input 
                  placeholder="Seu nome"
                  className="h-12 rounded-xl border-2"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  WhatsApp
                </label>
                <Input 
                  placeholder="(11) 99999-9999"
                  className="h-12 rounded-xl border-2"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                />
              </div>
              <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-[10px] text-yellow-700 leading-tight">
                <p>Ao solicitar, você concorda com nossos Termos de Uso. O match final depende da disponibilidade de profissionais na sua região.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="ghost" onClick={prevStep}>Voltar</Button>
              <Button onClick={handleFinish} disabled={!formData.clientName || !formData.clientPhone} className="rounded-xl px-8 bg-primary hover:bg-primary/90 text-white font-bold text-lg h-14">
                Confirmar Solicitação
              </Button>
            </CardFooter>
          </>
        )}
      </Card>

      <div className="mt-8 text-center space-y-4">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-green-500" /> Transação Protegida</span>
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-green-500" /> Garantia de 7 dias</span>
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-green-500" /> Profissional Verificado</span>
        </div>
      </div>
    </div>
  )
}
