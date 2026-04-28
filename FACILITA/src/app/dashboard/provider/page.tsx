import React from 'react'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Clock, 
  CheckCircle2, 
  Package, 
  Calendar, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default async function ProviderDashboardPage() {
  const supabase = await createServerSupabase()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'provider') {
    return redirect('/dashboard')
  }

  // 1. Check if professional is verified
  const { data: providerData } = await supabase
    .from('providers')
    .select('*')
    .eq('id', user.id)
    .single()

  const isVerified = providerData?.verification_status === 'approved'

  // 2. Fetch Available Opportunities (No provider assigned, status created)
  const { data: opportunities } = await supabase
    .from('orders')
    .select(`
      *,
      service_categories (name, icon)
    `)
    .eq('status', 'created')
    .is('provider_id', null)
    .order('created_at', { ascending: false })
    .limit(5)

  // 3. Fetch Active Jobs (Assigned to this provider)
  const { data: activeJobs } = await supabase
    .from('orders')
    .select(`
      *,
      service_categories (name, icon)
    `)
    .eq('provider_id', user.id)
    .in('status', ['accepted', 'in_progress'])
    .order('updated_at', { ascending: false })
  // 4. Fetch Wallet Balance
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance_available')
    .eq('provider_id', user.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        
        {/* Verification Alert */}
        {!isVerified && (
          <div className="mb-8 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="font-bold text-yellow-700">Perfil em Análise</p>
                <p className="text-sm text-yellow-600">Complete seu cadastro para começar a aceitar pedidos.</p>
              </div>
            </div>
            <Link href="/dashboard/onboarding">
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 font-bold rounded-xl">Completar Cadastro</Button>
            </Link>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Painel do <span className="text-primary italic">Profissional</span>
            </h1>
            <p className="text-muted-foreground">Gerencie suas oportunidades e serviços ativos.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard/provider/wallet" className="group">
              <div className="bg-white px-6 py-4 rounded-3xl shadow-xl border border-transparent hover:border-primary/30 transition-all flex items-center gap-4 cursor-pointer active:scale-95">
                <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black opacity-50 tracking-widest">Saldo Disponível</p>
                  <p className="font-black text-2xl text-foreground">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(wallet?.balance_available || 0)}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all ml-2" />
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Active Jobs Section */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Serviços Ativos
              </h2>
              {activeJobs && activeJobs.length > 0 ? (
                <div className="space-y-4">
                  {activeJobs.map((job) => (
                    <Link key={job.id} href={`/dashboard/provider/jobs/${job.id}`}>
                      <Card className="border-none shadow-xl hover:shadow-2xl transition-all bg-background border-l-4 border-l-primary group cursor-pointer">
                        <CardContent className="p-6 flex items-center justify-between">
                          <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                              {job.service_categories?.icon || '⚡'}
                            </div>
                            <div>
                                <h3 className="font-bold">{job.service_categories?.name}</h3>
                                <p className="text-sm text-muted-foreground">{job.neighborhood} • {job.urgency}</p>
                            </div>
                          </div>
                          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none capitalize">{job.status}</Badge>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed">
                  <Package className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium">Você não tem nenhum job ativo no momento.</p>
                </div>
              )}
            </div>

            {/* Opportunities Section */}
            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500 fill-current" />
                Novas Oportunidades
              </h2>
              <div className="space-y-4">
                {opportunities && opportunities.length > 0 ? (
                  opportunities.map((opp) => (
                    <Card key={opp.id} className="border-none shadow-lg bg-background p-6 hover:translate-x-1 transition-transform border-r-4 border-r-yellow-500/20">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-3 flex-grow">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-yellow-500/5 text-yellow-700 border-yellow-500/20 uppercase text-[10px] font-black">Pedido Urgente</Badge>
                            <span className="text-xs text-muted-foreground">{new Date(opp.created_at).toLocaleTimeString()}</span>
                          </div>
                          <h3 className="text-lg font-bold">{opp.service_categories?.name || 'Serviço Geral'}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{opp.description}</p>
                          <div className="flex gap-4 items-center">
                            <span className="flex items-center gap-1 text-xs font-bold"><MapPin className="h-3.5 w-3.5 text-primary" /> {opp.neighborhood}</span>
                            <span className="flex items-center gap-1 text-xs font-bold text-green-600"><DollarSign className="h-3.5 w-3.5" /> Pagar no Ato</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Link href={`/dashboard/provider/jobs/${opp.id}`} className="w-full md:w-auto">
                            <Button className="w-full md:w-auto rounded-xl bg-black text-white font-bold h-12 px-8 hover:bg-black/80">Detalhes</Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="p-8 text-center text-muted-foreground text-sm italic">Buscando novos pedidos em SP...</p>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar: Profile & Rating stats */}
          <div className="space-y-8">
            <Card className="border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="text-lg">Seu Desempenho</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Avaliação Média</span>
                        <div className="flex items-center gap-1 text-yellow-500 font-bold">
                            <Star className="h-4 w-4 fill-current" />
                            {providerData?.rating_avg?.toFixed(1) || '0.0'}
                        </div>
                    </div>
                    <div className="flex justify-between items-center border-t pt-4">
                        <span className="text-sm font-medium">Taxa de Aceite</span>
                        <span className="font-bold">100%</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-4">
                        <span className="text-sm font-medium">Jobs Concluídos</span>
                        <span className="font-bold">{providerData?.total_services || 0}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="text-lg">Horário de Trabalho</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Seg - Sex</span>
                        <span className="font-bold">08:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sábado</span>
                        <span className="font-bold">08:00 - 12:00</span>
                    </div>
                </CardContent>
            </Card>

            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                <h4 className="font-bold text-sm mb-2">Dica Pro</h4>
                <p className="text-xs text-muted-foreground">Fique online nos horários de pico (18h-21h) para receber 3x mais oportunidades de emergência.</p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

function Star(props: any) {
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
