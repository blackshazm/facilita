'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Briefcase, 
  User, 
  MapPin, 
  ShieldCheck, 
  ChevronRight, 
  Camera, 
  Loader2,
  FileText,
  Star
} from 'lucide-react'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'

export default function ProviderOnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    bio: '',
    experienceYears: '',
    specialty: 'Instalações Residenciais',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Upsert into providers table
      const { error } = await supabase
        .from('providers')
        .upsert({
          id: user.id,
          bio: formData.bio,
          experience_years: parseInt(formData.experienceYears),
          verification_status: 'pending', // Mark as pending for admin approval
          is_active: true
        })

      if (error) throw error

      alert('Cadastro enviado para análise! Nossa equipe entrará em contato em até 48h.')
      router.push('/dashboard/provider')
    } catch (error: any) {
      alert('Erro ao salvar cadastro: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header />
      
      <main className="flex-grow flex flex-col items-center py-12 px-4">
        <div className="max-w-2xl w-full space-y-8">
            <div className="text-center space-y-2">
                <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20 text-white">
                    <Briefcase className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">Onboarding do Profissional</h1>
                <p className="text-muted-foreground">Complete seu perfil para transmitir confiança aos clientes.</p>
            </div>

            <Card className="border-none shadow-2xl glass">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className="text-xl font-bold">Informações Profissionais</CardTitle>
                    <CardDescription>Esses dados serão exibidos no seu perfil público.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-primary" />
                                Anos de Experiência
                            </label>
                            <Input 
                                type="number"
                                placeholder="Ex: 10"
                                value={formData.experienceYears}
                                onChange={(e) => setFormData({...formData, experienceYears: e.target.value})}
                                required
                                className="h-12 rounded-xl border-2 focus-visible:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                Biografia Profissional
                            </label>
                            <Textarea 
                                placeholder="Conte um pouco sobre sua trajetória, certificações e especialidades..."
                                className="min-h-[150px] rounded-xl border-2 focus-visible:ring-primary"
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <Card className="p-4 border-2 border-dashed border-muted hover:border-primary/50 transition-colors cursor-pointer group flex flex-col items-center gap-2 text-center">
                                <Camera className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Foto de Perfil</span>
                            </Card>
                            <Card className="p-4 border-2 border-dashed border-muted hover:border-primary/50 transition-colors cursor-pointer group flex flex-col items-center gap-2 text-center">
                                <ShieldCheck className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Documento (RG/CNH)</span>
                            </Card>
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl bg-primary text-lg font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 mt-8">
                            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Finalizar e Enviar para Análise'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="flex justify-center gap-8 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1"><ShieldCheck className="h-3.3 w-3.5 text-green-600" /> Verificação de Identidade</span>
                <span className="flex items-center gap-1"><ShieldCheck className="h-3.3 w-3.5 text-green-600" /> Histórico Criminal</span>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
