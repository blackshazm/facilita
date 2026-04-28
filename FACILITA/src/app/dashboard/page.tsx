import React from 'react'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Zap, 
  Search, 
  Star, 
  Wrench, 
  Droplets, 
  Hammer, 
  Paintbrush, 
  Lightbulb,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  const role = user.user_metadata?.role || 'client'

  if (role === 'provider') {
    return redirect('/dashboard/provider')
  }

  const categories = [
    { name: 'Elétrica', icon: Zap },
    { name: 'Hidráulica', icon: Droplets },
    { name: 'Reparos', icon: Wrench },
    { name: 'Montagem', icon: Hammer },
    { name: 'Pintura', icon: Paintbrush },
    { name: 'Limpeza', icon: Lightbulb },
  ]

  const recommendations = [
    { name: 'Marcos Silva', rating: 4.9, reviews: 124, price: '80,00', category: 'Eletricista' },
    { name: 'Ana Oliveira', rating: 4.8, reviews: 92, price: '65,00', category: 'Encanadora' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 space-y-10">
        
        {/* Topo Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-primary font-bold uppercase tracking-widest text-[10px]">Bem-vindo de volta</p>
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                O que você precisa <span className="text-primary italic">hoje?</span>
              </h1>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-card flex items-center justify-center text-card-foreground font-black shadow-lg">
              {user.user_metadata?.full_name?.charAt(0) || 'U'}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Pesquisar por serviços ou profissionais..." 
              className="w-full h-16 pl-14 pr-6 rounded-3xl bg-card border-none text-card-foreground placeholder:text-muted-foreground font-medium shadow-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* Categorias Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-foreground">Categorias</h2>
            <Button variant="ghost" className="text-primary font-bold gap-2 text-xs uppercase tracking-widest">
              Ver tudo <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Card key={cat.name} className="border-none shadow-xl hover:scale-105 transition-transform cursor-pointer overflow-hidden group">
                <CardContent className="p-6 flex flex-col items-center gap-3">
                  <div className="p-3 rounded-2xl bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <cat.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-card-foreground">{cat.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recomendações Section */}
        <section className="space-y-6 pb-12">
          <h2 className="text-xl font-black text-foreground">Profissionais em Destaque</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((prof) => (
              <Card key={prof.name} className="border-none shadow-xl hover:shadow-2xl transition-all bg-card group">
                <CardContent className="p-6 flex gap-6">
                  <div className="h-24 w-24 rounded-3xl bg-muted/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <User className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="flex-grow space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{prof.category}</p>
                        <h3 className="text-lg font-bold text-card-foreground">{prof.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
                        <Star className="h-3 w-3 text-primary fill-current" />
                        <span className="text-xs font-black text-primary">{prof.rating}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">A partir de</p>
                        <p className="text-xl font-black text-card-foreground">R$ {prof.price}</p>
                      </div>
                      <Link href="/solicitar">
                        <Button className="rounded-xl px-6 bg-primary font-bold shadow-lg shadow-primary/20">
                          Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Floating CTA for Mobile (Optional but suggested in prompt) */}
        <div className="fixed bottom-24 left-0 right-0 px-6 flex justify-center md:hidden pointer-events-none">
          <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-black shadow-2xl shadow-primary/40 pointer-events-auto gap-2">
            <Plus className="h-5 w-5" />
            Criar Pedido Rápido
          </Button>
        </div>

      </main>

      <Footer />
    </div>
  )
}

// Minimal placeholder for User icon since I don't have it imported correctly in the snippet
function User({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function Plus({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
