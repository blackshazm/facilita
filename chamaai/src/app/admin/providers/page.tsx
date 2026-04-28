import React from 'react'
import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, CheckCircle, XCircle, Clock, Star, Briefcase, Zap } from 'lucide-react'
import Link from 'next/link'
import { ApproveProviderButton } from '@/components/admin/ApproveProviderButton'

export default async function AdminProvidersPage() {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return redirect('/dashboard')

  const { data: providers } = await supabase
    .from('providers')
    .select(`
      *,
      profiles (full_name, email, created_at)
    `)
    .order('created_at', { ascending: false })

  const verificationBg: Record<string, string> = {
    pending: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    approved: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  const tierBg: Record<string, string> = {
    new: 'bg-slate-500/20 text-slate-300',
    verified: 'bg-blue-500/20 text-blue-300',
    top_rated: 'bg-yellow-500/20 text-yellow-300',
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="font-black text-white text-lg">ChamaAi <span className="text-primary text-sm font-bold">Admin</span></span>
            </Link>
          </div>
          <nav className="flex items-center gap-6 text-sm text-white/60">
            <Link href="/admin" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/admin/providers" className="text-white font-bold">Prestadores</Link>
            <Link href="/admin/orders" className="hover:text-white transition-colors">Pedidos</Link>
            <Link href="/admin/disputes" className="hover:text-white transition-colors">Disputas</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="mb-10 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black">Gestão de <span className="text-primary">Prestadores</span></h1>
            <p className="text-white/50">Aprovação, KYC e controle de qualidade.</p>
          </div>
          <Badge className="bg-primary/20 text-primary border-none px-4 py-2 text-sm font-bold">
            {providers?.length ?? 0} cadastrados
          </Badge>
        </div>

        <div className="space-y-4">
          {providers?.map((p) => (
            <Card key={p.id} className="bg-white/5 border-white/10 hover:bg-white/8 transition-colors overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Info */}
                  <div className="flex items-center gap-4 flex-grow">
                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-2xl text-white/60 shrink-0">
                      {p.profiles?.full_name?.charAt(0) ?? '?'}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg">{p.profiles?.full_name}</h3>
                        <Badge className={`text-[10px] font-black border ${verificationBg[p.verification_status]}`}>
                          {p.verification_status}
                        </Badge>
                        <Badge className={`text-[10px] font-black border-none ${tierBg[p.tier]}`}>
                          {p.tier}
                        </Badge>
                      </div>
                      <p className="text-white/50 text-sm">{p.profiles?.email}</p>
                      <div className="flex gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400" />{p.rating_avg?.toFixed(1) ?? '0.0'}</span>
                        <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-400" />{p.total_services} jobs</span>
                        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{p.experience_years} anos</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio preview */}
                  {p.bio && (
                    <p className="text-white/40 text-sm max-w-xs hidden md:block italic line-clamp-2">
                      "{p.bio}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 shrink-0">
                    {p.verification_status === 'pending' ? (
                      <ApproveProviderButton providerId={p.id} />
                    ) : p.verification_status === 'approved' ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/20 border h-9 px-4">✓ Aprovado</Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/20 border h-9 px-4">✗ Rejeitado</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!providers || providers.length === 0) && (
            <div className="p-20 text-center text-white/30 italic">
              Nenhum prestador cadastrado ainda.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
