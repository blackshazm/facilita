import React from 'react'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { createServerSupabase } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Clock, 
  MessageSquare, 
  ChevronLeft,
  User,
  Zap,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  CreditCard,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { ChatBox } from '@/components/shared/ChatBox'
import { Button } from '@/components/ui/button'
import { PaymentButton } from '@/components/order/PaymentButton'
import { DisputeClientButton } from '@/components/order/DisputeClientButton'


export default async function ClientOrderDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase()
  const { id } = await params
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // Fetch order details
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      service_categories (name, icon),
      provider:provider_id (
        id,
        profiles (full_name, avatar_url),
        rating_avg,
        experience_years
      )
    `)
    .eq('id', id)
    .single()

  if (error || !order) return notFound()

  // Security check: ensure order belongs to this client
  const isOwner = order.client_id === user.id || order.client_phone === user.user_metadata?.phone
  if (!isOwner) return redirect('/dashboard')

  const provider = order.provider

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-8 hover:underline">
          <ChevronLeft className="h-4 w-4" />
          Voltar para Meus Pedidos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary/20 text-primary border-none uppercase text-[10px] font-black">{order.status}</Badge>
                    <span className="text-sm text-muted-foreground">Solicitado {new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <h1 className="text-3xl font-black">{order.service_categories?.icon} {order.service_categories?.name}</h1>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {order.neighborhood}
                  </p>
               </div>
               
               {/* Payment Summary */}
               <Card className="bg-white border-none shadow-xl p-6 w-full md:w-auto">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <span className="text-xs uppercase font-black opacity-50">Estimativa</span>
                  </div>
                  <p className="text-2xl font-black">R$ {order.price_estimate || '---'}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 underline">Ajustado após visita técnica</p>
               </Card>
            </div>

            {/* Payment / Dispute Section */}
            {order.status === 'completed_provider' && (
              <div className="animate-in slide-in-from-top-10 duration-500 space-y-2">
                <PaymentButton orderId={order.id} amount={order.price_estimate || 150} />
                <DisputeClientButton orderId={order.id} />
              </div>
            )}
            {order.status === 'disputed' && (
              <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 space-y-2">
                <div className="flex items-center gap-2 font-black">
                  <AlertTriangle className="h-5 w-5" /> Pagamento Bloqueado (Disputa)
                </div>
                <p className="text-sm">Nossa equipe de mediação está analisando o caso e entrará em contato em até 24 horas. O valor não será repassado ao prestador até a resolução.</p>
              </div>
            )}


            {/* Tracking / Timeline Placeholder */}
            <div className="p-8 rounded-3xl bg-white shadow-xl space-y-6">
                <h3 className="font-bold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" /> 
                    Status do Atendimento
                </h3>
                <div className="space-y-8 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-muted">
                    <div className="flex gap-6 relative">
                        <div className={`h-6 w-6 rounded-full shrink-0 z-10 flex items-center justify-center ${['created', 'accepted', 'on_site', 'in_progress', 'completed_provider'].includes(order.status) ? 'bg-primary' : 'bg-muted'}`}>
                            <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Pedido Recebido</p>
                            <p className="text-xs text-muted-foreground">Sua solicitação foi enviada aos profissionais.</p>
                        </div>
                    </div>
                    <div className="flex gap-6 relative">
                        <div className={`h-6 w-6 rounded-full shrink-0 z-10 flex items-center justify-center ${['accepted', 'on_site', 'in_progress', 'completed_provider'].includes(order.status) ? 'bg-primary' : 'bg-muted'}`}>
                            <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Profissional Aceitou</p>
                            <p className="text-xs text-muted-foreground">O profissional iniciou o deslocamento.</p>
                        </div>
                    </div>
                    <div className="flex gap-6 relative">
                        <div className={`h-6 w-6 rounded-full shrink-0 z-10 flex items-center justify-center ${['on_site', 'in_progress', 'completed_provider'].includes(order.status) ? 'bg-primary' : 'bg-muted'}`}>
                            <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Execução em Andamento</p>
                            <p className="text-xs text-muted-foreground">O serviço está sendo realizado no local.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat */}
            {provider && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" /> Chat com o Prestador
                </h2>
                <ChatBox orderId={id} currentUserId={user.id} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {provider ? (
              <Card className="border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                   <CardDescription className="text-[10px] uppercase font-black text-primary">Seu Profissional</CardDescription>
                   <CardTitle className="flex items-center gap-3">
                      {provider.profiles.full_name}
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-[1.25rem] bg-muted relative overflow-hidden">
                            {/* avatar image here */}
                            <div className="flex items-center justify-center h-full text-2xl font-black">{provider.profiles.full_name.charAt(0)}</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-1 font-bold">
                                {provider.rating_avg.toFixed(1)} <Zap className="h-3 w-3 text-yellow-500 fill-current" />
                            </div>
                            <p className="text-xs text-muted-foreground">{provider.experience_years} anos de exp.</p>
                        </div>
                    </div>
                    <Button className="w-full h-12 rounded-xl bg-primary text-sm font-bold shadow-lg shadow-primary/10">Ligar p/ Profissional</Button>
                </CardContent>
              </Card>
            ) : (
                <div className="p-8 rounded-3xl bg-primary/10 border-2 border-dashed border-primary/20 text-center space-y-4">
                    <Zap className="h-10 w-10 text-primary mx-auto animate-pulse" />
                    <div className="space-y-1">
                        <h4 className="font-bold text-primary">Triagem Inteligente</h4>
                        <p className="text-xs text-muted-foreground">Estamos selecionando o melhor e mais próximo eletricista para você.</p>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-3xl shadow-xl space-y-4">
                <h4 className="font-bold text-sm italic">Proteção ChamaAi</h4>
                <div className="space-y-3">
                    <div className="flex gap-3 text-xs">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        <p>Seguro contra danos até R$ 5.000</p>
                    </div>
                    <div className="flex gap-3 text-xs">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <p>Garantia de 90 dias no serviço</p>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
