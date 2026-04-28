import React from 'react'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { ProviderCard } from '@/components/provider/ProviderCard'
import { createServerSupabase } from '@/lib/supabase/server'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MapPin, SlidersHorizontal, Zap } from 'lucide-react'

export default async function ProfissionaisPage() {
  const supabase = await createServerSupabase()
  
  // Fetch providers with their profiles
  const { data: providers, error } = await supabase
    .from('providers')
    .select(`
      *,
      profiles (*)
    `)
    .eq('is_active', true)
    .order('rating_avg', { ascending: false })

  if (error) console.error('Error fetching providers:', error)

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Encontre o <span className="text-primary italic">Especialista</span> Ideal
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Profissionais verificados, avaliados e prontos para atender sua residência em São Paulo.
            </p>
          </div>
          
          <div className="w-full md:w-auto flex items-center gap-4">
            <div className="relative group flex-grow">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <Input 
                placeholder="Seu bairro em SP..." 
                className="pl-10 h-14 w-full md:w-64 rounded-2xl border-none shadow-xl shadow-primary/5 focus-visible:ring-primary"
              />
            </div>
            <Button size="icon" variant="outline" className="h-14 w-14 rounded-2xl border-none shadow-xl">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Fila de Cards */}
        {providers && providers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl shadow-xl border-dashed border-2 border-muted">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-primary opacity-50" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Nenhum profissional online agora</h3>
            <p className="text-muted-foreground max-w-sm mb-8">
              Nossa rede em SP está crescendo. Que tal ser o primeiro parceiro da sua região?
            </p>
            <Button size="lg" className="rounded-2xl px-10 h-14 bg-primary font-bold">
              <Zap className="mr-2 h-5 w-5 fill-current" />
              Quero ser Parceiro
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
