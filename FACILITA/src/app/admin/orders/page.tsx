import React from 'react'
import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Zap, Filter } from 'lucide-react'
import Link from 'next/link'

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; urgency?: string }
}) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return redirect('/dashboard')

  const { status, urgency } = await searchParams

  let query = supabase
    .from('orders')
    .select('*, service_categories(name, icon)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (status) query = query.eq('status', status)
  if (urgency) query = query.eq('urgency', urgency)

  const { data: orders } = await query

  const statusColor: Record<string, string> = {
    created: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
    accepted: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/20',
    in_progress: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20',
    completed_provider: 'bg-green-500/20 text-green-300 border-green-500/20',
    disputed: 'bg-red-500/20 text-red-300 border-red-500/20',
    cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/20',
  }

  const urgencyColor: Record<string, string> = {
    normal: 'bg-slate-700 text-slate-300',
    urgent: 'bg-orange-500/20 text-orange-400',
    emergency: 'bg-red-500/20 text-red-400',
  }

  const filterStatuses = ['created', 'accepted', 'in_progress', 'completed_provider', 'disputed', 'cancelled']

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="font-black text-white text-lg">FACILITA <span className="text-primary text-sm font-bold">Admin</span></span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-white/60">
            <Link href="/admin" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/admin/providers" className="hover:text-white transition-colors">Prestadores</Link>
            <Link href="/admin/orders" className="text-white font-bold">Pedidos</Link>
            <Link href="/admin/disputes" className="hover:text-white transition-colors">Disputas</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="mb-8 space-y-1">
          <h1 className="text-3xl font-black">Fila de <span className="text-primary">Pedidos</span></h1>
          <p className="text-white/50">Todos os pedidos com filtros avançados.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/admin/orders">
            <Badge className={`cursor-pointer px-3 py-1.5 ${!status ? 'bg-primary text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
              Todos
            </Badge>
          </Link>
          {filterStatuses.map((s) => (
            <Link key={s} href={`/admin/orders?status=${s}`}>
              <Badge className={`cursor-pointer px-3 py-1.5 border ${status === s ? 'bg-primary border-primary text-white' : `${statusColor[s] || 'bg-white/10 text-white/70'} hover:opacity-80`}`}>
                {s}
              </Badge>
            </Link>
          ))}
        </div>

        <Card className="bg-white/5 border-white/10 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/5">
                  <tr className="text-white/40 text-xs uppercase tracking-widest font-bold">
                    <th className="text-left px-6 py-4">Serviço</th>
                    <th className="text-left px-6 py-4">Cliente</th>
                    <th className="text-left px-6 py-4">Bairro</th>
                    <th className="text-left px-6 py-4">Urgência</th>
                    <th className="text-left px-6 py-4">Status</th>
                    <th className="text-left px-6 py-4">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders?.map((order: any) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        {order.service_categories?.icon} {order.service_categories?.name || 'Geral'}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{order.client_name}</p>
                          <p className="text-white/40 text-xs">{order.client_phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/50">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{order.neighborhood}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${urgencyColor[order.urgency]}`}>
                          {order.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black border uppercase ${statusColor[order.status] || 'bg-slate-700 text-slate-300'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/40 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!orders || orders.length === 0) && (
                <p className="p-12 text-center text-white/30 italic">Nenhum pedido encontrado.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
