import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { createServerSupabase } from '@/lib/supabase/server'
import { VerifiedBadge } from '@/components/provider/VerifiedBadge'
import { TierBadge } from '@/components/provider/TierBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  MapPin, 
  Briefcase, 
  Clock, 
  ShieldCheck, 
  MessageSquare, 
  Zap,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  Share2
} from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function PerfilProfissionalPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase()
  const { id } = await params

  // Fetch provider detail
  const { data: provider, error } = await supabase
    .from('providers')
    .select(`
      *,
      profiles (*),
      provider_specialties (
        service_categories (name, icon)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !provider) {
    console.error('Error fetching provider:', error)
    return notFound()
  }

  const profile = provider.profiles
  const rating = provider.rating_avg || 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-grow">
        {/* Banner Section */}
        <div className="h-64 md:h-80 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-muted relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_left_-1px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
          <div className="container mx-auto px-4 h-full flex items-end pb-8">
            <Link href="/profissionais">
              <Button variant="ghost" size="sm" className="absolute top-8 left-4 text-primary font-bold hover:bg-white/50">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Sidebar: Profile Info */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-primary/5 border flex flex-col items-center text-center space-y-6">
                <div className="relative h-40 w-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl">
                  <Image 
                    src={profile.avatar_url || `https://i.pravatar.cc/300?u=${provider.id}`} 
                    alt={profile.full_name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-black tracking-tight">{profile.full_name}</h1>
                  <div className="flex flex-wrap justify-center gap-2">
                    <TierBadge tier={provider.tier} />
                    {provider.verification_status === 'approved' && <VerifiedBadge />}
                  </div>
                </div>

                <div className="flex items-center gap-4 py-2 border-y border-muted/50 w-full justify-center">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold text-lg">
                      <Star className="h-5 w-5 fill-current" />
                      {rating.toFixed(1)}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mt-1">Avaliação</p>
                  </div>
                  <div className="h-8 w-px bg-muted" />
                  <div className="text-center">
                    <div className="font-bold text-lg">+{provider.total_services}</div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mt-1">Jobs</p>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <Link href="/solicitar" className="w-full">
                    <Button size="lg" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-bold text-lg shadow-xl shadow-primary/20">
                      <Zap className="mr-2 h-5 w-5 fill-current" />
                      Contratar Agora
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="w-full h-14 rounded-2xl border-2 font-bold group">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Enviar Mensagem
                  </Button>
                </div>

                <div className="pt-4 flex justify-center gap-4">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Trust Box */}
              <div className="bg-muted/30 rounded-3xl p-6 space-y-4 border border-white">
                <h3 className="font-bold text-sm">Garantias FACILITA</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 text-xs">
                    <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
                    <p><span className="font-bold">Pagamento Seguro:</span> Seu dinheiro fica protegido até a conclusão do serviço.</p>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <p><span className="font-bold">Garantia de 7 dias:</span> Se algo der errado, nós resolvemos.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content: Bio & Specialties */}
            <div className="lg:col-span-2 space-y-12 h-fit">
              <div className="space-y-6">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Clock className="h-6 w-6 text-primary" />
                  Sobre o Profissional
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {provider.bio || "Este profissional ainda não adicionou uma biografia detalhada. No entanto, ele é um parceiro verificado pela FACILITA e está pronto para atender suas necessidades elétricas."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-white">
                    <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center shadow-sm">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Experiência</p>
                      <p className="font-bold">{provider.experience_years} anos no mercado</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-white">
                    <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center shadow-sm">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Membro desde</p>
                      <p className="font-bold">{new Date(provider.created_at).getFullYear()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  Especialidades
                </h2>
                <div className="flex flex-wrap gap-3">
                  {provider.provider_specialties && provider.provider_specialties.length > 0 ? (
                    provider.provider_specialties.map((spec: any, idx: number) => (
                      <Badge key={idx} variant="secondary" className="px-4 py-2 rounded-xl bg-muted text-foreground text-sm font-bold border-none">
                        {spec.service_categories.icon} {spec.service_categories.name}
                      </Badge>
                    ))
                  ) : (
                    <>
                      <Badge variant="secondary" className="px-4 py-2 rounded-xl bg-muted text-foreground text-sm font-bold border-none">🚿 Chuveiros</Badge>
                      <Badge variant="secondary" className="px-4 py-2 rounded-xl bg-muted text-foreground text-sm font-bold border-none">🔌 Tomadas</Badge>
                      <Badge variant="secondary" className="px-4 py-2 rounded-xl bg-muted text-foreground text-sm font-bold border-none">⚡ Quadros</Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Reviews Placeholder */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500" />
                    Avaliações Recentes
                  </h2>
                </div>
                <div className="space-y-6">
                  {/* Empty state for reviews */}
                  <div className="p-8 rounded-3xl bg-muted/10 border-2 border-dashed border-muted text-center space-y-2">
                    <p className="text-muted-foreground font-medium">As avaliações de clientes via FACILITA aparecerão aqui após a conclusão dos jobs.</p>
                  </div>
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
