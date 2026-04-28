'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Zap, Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, Phone } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [role, setRole] = useState<'client' | 'provider'>('client')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: role,
          }
        }
      })

      if (error) throw error

      setSuccess(true)
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao criar conta. Verifique os dados.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
        <Card className="w-full max-w-md border-none shadow-2xl glass text-center p-8 space-y-6">
          <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto text-green-600">
            <Mail className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black">Confirme seu e-mail</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Enviamos um link de confirmação para <b>{email}</b>. 
              Por favor, verifique sua caixa de entrada e spam.
            </CardDescription>
          </div>
          <Link href="/login" className="block">
            <Button className="w-full h-14 rounded-2xl bg-primary font-bold">
              Ir para o Login
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 py-20">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg">
          <Zap className="h-5 w-5 fill-current" />
        </div>
        <span className="text-xl font-black tracking-tighter uppercase">FACILITA</span>
      </Link>

      <Card className="w-full max-w-md border-none shadow-2xl glass">
        <CardHeader className="space-y-2 text-center pb-4">
          <CardTitle className="text-3xl font-black">Crie sua conta</CardTitle>
          <CardDescription>Escolha seu perfil e comece agora.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={role} onValueChange={(v: any) => setRole(v)} className="w-full">
            <TabsList className="grid grid-cols-2 h-14 bg-muted/50 p-1.5 rounded-2xl">
              <TabsTrigger value="client" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Sou Cliente</TabsTrigger>
              <TabsTrigger value="provider" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold">Sou Profissional</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 px-1">
                <User className="h-4 w-4 text-primary" />
                Nome Completo
              </label>
              <Input 
                placeholder="Ex: João Silva" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-12 rounded-xl border-2 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 px-1">
                <Phone className="h-4 w-4 text-primary" />
                WhatsApp (Telefone)
              </label>
              <Input 
                placeholder="(11) 99999-9999" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="h-12 rounded-xl border-2 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 px-1">
                <Mail className="h-4 w-4 text-primary" />
                E-mail
              </label>
              <Input 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-2 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 px-1">
                <Lock className="h-4 w-4 text-primary" />
                Senha
              </label>
              <Input 
                type="password" 
                placeholder="Mínimo 6 caracteres" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-2 focus-visible:ring-primary"
              />
            </div>

            <div className="flex items-start gap-2 px-1">
              <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-tight">
                Seus dados estão protegidos. Ao clicar em Criar Conta, você concorda com nossos <Link href="#" className="font-bold underline">Termos e Condições</Link>.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold leading-tight">
                {errorMessage}
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl bg-primary text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Criar Minha Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t pt-6 bg-muted/30 pb-8">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">Entre aqui</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
