import React from 'react'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { createServerSupabase } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  AlertTriangle,
  ChevronLeft,
  Camera,
  CheckCircle,
  XCircle,
  Phone
} from 'lucide-react'
import Link from 'next/link'
import { AcceptJobButton } from '@/components/order/AcceptJobButton'
import { JobExecutionControls } from '@/components/order/JobExecutionControls'
import { ChatBox } from '@/components/shared/ChatBox'

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase()
  const { id } = await params
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'provider') {
    return redirect('/login')
  }

  // Fetch job details
  const { data: job, error } = await supabase
    .from('orders')
    .select(`
      *,
      service_categories (name, icon)
    `)
    .eq('id', id)
    .single()

  if (error || !job) return notFound()

  const isAssignedToMe = job.provider_id === user.id
  const isAvailable = !job.provider_id && job.status === 'created'

  return (
    <div className="flex min-h-screen flex-col bg-muted/10">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Link href="/dashboard/provider" className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-8 hover:underline">
          <ChevronLeft className="h-4 w-4" />
          Voltar para o Painel
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Job Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={`rounded-lg uppercase text-[10px] font-black ${
                  job.urgency === 'emergency' ? 'bg-red-500' : 
                  job.urgency === 'urgent' ? 'bg-yellow-600' : 'bg-primary'
                }`}>
                  {job.urgency}
                </Badge>
                <span className="text-sm text-muted-foreground">Solicitado {new Date(job.created_at).toLocaleDateString('pt-BR')} às {new Date(job.created_at).toLocaleTimeString().slice(0,5)}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black">
                {job.service_categories?.icon} {job.service_categories?.name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">{job.neighborhood}, São Paulo - SP</span>
              </div>
            </div>

            <Card className="border-none shadow-xl bg-background overflow-hidden relative">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg">Descrição do Problema</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-lg text-foreground/80 leading-relaxed whitespace-pre-wrap italic">
                  "{job.description}"
                </p>
                
                {/* Evidences (Photos) Placeholder */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="aspect-square rounded-2xl bg-muted/50 border-2 border-dashed border-muted flex items-center justify-center text-muted-foreground group">
                      <Camera className="h-8 w-8 opacity-20 group-hover:opacity-40" />
                   </div>
                   <div className="aspect-square rounded-2xl bg-muted/50 border-2 border-dashed border-muted flex items-center justify-center text-muted-foreground">
                      <Camera className="h-8 w-8 opacity-20" />
                   </div>
                </div>
              </CardContent>
            </Card>

            {isAssignedToMe && (
              <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  Chat com o Cliente
                </h2>
                <ChatBox orderId={job.id} currentUserId={user.id} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/10 flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase translate-y-1">Pagamento Garantido</h4>
                    <p className="text-xs text-muted-foreground mt-1">O valor será liberado via FACILITA 24h após a conclusão.</p>
                  </div>
               </div>
               <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase translate-y-1">Prazo Estimado</h4>
                    <p className="text-xs text-muted-foreground mt-1">Atendimento imediato solicitado pelo cliente.</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Actoin Box */}
          <div className="space-y-6">
            <Card className="border-none shadow-2xl bg-white overflow-hidden p-8 space-y-6 text-center">
              {isAvailable ? (
                <>
                  <div className="h-20 w-20 rounded-[2rem] bg-yellow-500/10 text-yellow-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Zap className="h-10 w-10 fill-current" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black">Oportunidade Aberta</h2>
                    <p className="text-sm text-muted-foreground">Aceite agora para liberar o acesso ao endereço exato e chat com o cliente.</p>
                  </div>
                  
                  <div className="pt-4 space-y-3">
                    <AcceptJobButton orderId={job.id} />
                    <p className="text-[10px] text-muted-foreground">Ao aceitar, você se compromete com o atendimento rápido.</p>
                  </div>
                </>
              ) : isAssignedToMe ? (
                <>
                   <div className="flex flex-col items-center gap-4">
                     <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <CheckCircle className="h-10 w-10" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black">Você está no comando!</h3>
                        <p className="text-sm text-muted-foreground">Gerencie a execução do serviço abaixo.</p>
                     </div>
                   </div>
                   
                   <JobExecutionControls orderId={job.id} currentStatus={job.status} />

                   <div className="pt-6 space-y-4 border-t mt-6">
                      <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-bold">
                        <MessageSquare className="mr-2 h-5 w-5" /> Abrir Chat
                      </Button>
                      <Button variant="ghost" className="w-full text-red-600 font-bold">Cancelar Pedido</Button>
                   </div>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto opacity-50">
                    <XCircle className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold">Indisponível</h3>
                  <p className="text-sm text-muted-foreground">Este serviço já foi atribuído a outro profissional.</p>
                  <Link href="/dashboard/provider" className="block pt-4">
                    <Button variant="link" className="text-primary font-bold">Ver outros jobs</Button>
                  </Link>
                </>
              )}
            </Card>

            {/* Client Info (Hidden until accepted) */}
            <Card className="border-none shadow-xl bg-white overflow-hidden p-6">
               <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-4">Dados do Cliente</h4>
               {isAssignedToMe ? (
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold">
                            {job.client_name?.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold">{job.client_name}</p>
                            <p className="text-xs text-muted-foreground">Cliente Verificado</p>
                        </div>
                    </div>
                    <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-medium underline">{job.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-primary" />
                            <span className="font-medium">{job.client_phone}</span>
                        </div>
                    </div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center py-4 text-center space-y-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 opacity-50" />
                    <p className="text-xs text-muted-foreground">Aceite o job para visualizar endereço e contato.</p>
                 </div>
               )}
            </Card>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

function Zap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}
