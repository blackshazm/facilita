import React from 'react'
import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, MessageSquare, Zap, Calendar } from 'lucide-react'
import Link from 'next/link'
import { DisputeActionButton } from '@/components/admin/DisputeActionButton'

export default async function AdminDisputesPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return redirect('/dashboard')

  const { data: disputes } = await supabase
    .from('disputes')
    .select(`
      *,
      orders (
        id,
        description,
        neighborhood,
        client_name,
        price_final,
        service_categories(name, icon),
        provider:provider_id(profiles(full_name, avatar_url))
      ),
      opened_by_user:opened_by(full_name, role)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="font-black text-white text-lg">Facilita <span className="text-primary text-sm font-bold">Admin</span></span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-white/60">
            <Link href="/admin" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/admin/providers" className="hover:text-white transition-colors">Prestadores</Link>
            <Link href="/admin/orders" className="hover:text-white transition-colors">Pedidos</Link>
            <Link href="/admin/disputes" className="text-white font-bold">Disputas</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="mb-8 space-y-1">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            Gestão de <span className="text-red-400">Disputas</span>
          </h1>
          <p className="text-white/50">Casos em aberto exigindo mediação administrativa (Retenção de Saldo).</p>
        </div>

        {disputes && disputes.length > 0 ? (
          <div className="space-y-4">
            {disputes.map((dispute: any) => (
              <Card key={dispute.id} className="bg-red-500/5 border border-red-500/20 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3 flex-grow">
                      <div className="flex items-center gap-3">
                        <Badge className={`border font-black text-[10px] uppercase ${dispute.status === 'open' || dispute.status === 'under_review' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                          {dispute.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase border-white/10 text-white/40">{dispute.reason_category.replace('_', ' ')}</Badge>
                        <span className="text-white/40 text-xs flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(dispute.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">
                          {dispute.orders?.service_categories?.icon} {dispute.orders?.service_categories?.name}
                          <span className="ml-2 text-sm text-red-400 font-mono">R$ {dispute.frozen_amount} retidos</span>
                        </h3>
                        <p className="text-white/50 text-sm mt-1">Cliente: <span className="text-white">{dispute.orders?.client_name}</span> • Profissional: <span className="text-white">{dispute.orders?.provider?.profiles?.full_name}</span></p>
                      </div>
                      <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                        <p className="text-white/70 text-sm italic">"{dispute.description}"</p>
                        <p className="text-[10px] text-white/40 mt-2 uppercase font-bold">Aberta por: {dispute.opened_by_user?.full_name} ({dispute.opened_by_user?.role})</p>
                      </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      {dispute.status === 'open' || dispute.status === 'under_review' ? (
                        <DisputeActionButton disputeId={dispute.id} orderId={dispute.order_id} frozenAmount={dispute.frozen_amount} />
                      ) : (
                        <span className="text-xs font-bold text-green-400">Resolvida</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-green-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-green-400">Nenhuma disputa aberta</h3>
              <p className="text-white/40">Todas as disputas foram resolvidas. 🎉</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
