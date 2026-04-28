import React from 'react'
import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users, ShoppingBag, CheckCircle2, AlertTriangle,
  TrendingUp, Clock, Star, Zap, DollarSign, Activity
} from 'lucide-react'
import Link from 'next/link'

async function getAdminMetrics(supabase: any) {
  const [
    { count: totalOrders },
    { count: activeOrders },
    { count: totalProviders },
    { count: pendingProviders },
    { count: totalDisputes },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['accepted', 'on_site', 'in_progress']),
    supabase.from('providers').select('*', { count: 'exact', head: true }),
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'disputed'),
    supabase.from('orders')
      .select('*, service_categories(name, icon)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return { totalOrders, activeOrders, totalProviders, pendingProviders, totalDisputes, recentOrders }
}

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return redirect('/dashboard')
  }

  const {
    totalOrders, activeOrders, totalProviders,
    pendingProviders, totalDisputes, recentOrders
  } = await getAdminMetrics(supabase)

  const stats = [
    { label: 'Total de Pedidos', value: totalOrders ?? 0, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-500/10', change: '+12%' },
    { label: 'Em Andamento', value: activeOrders ?? 0, icon: Activity, color: 'text-green-600', bg: 'bg-green-500/10', change: 'agora' },
    { label: 'Prestadores', value: totalProviders ?? 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-500/10', change: 'ativos' },
    { label: 'KYC Pendente', value: pendingProviders ?? 0, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-500/10', change: 'revisar' },
    { label: 'Disputas', value: totalDisputes ?? 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-500/10', change: 'abertas' },
    { label: 'GMV Est.', value: 'R$ ---', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-500/10', change: 'este mês' },
  ]

  const statusColor: Record<string, string> = {
    created: 'bg-blue-100 text-blue-700',
    accepted: 'bg-indigo-100 text-indigo-700',
    on_site: 'bg-purple-100 text-purple-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed_provider: 'bg-green-100 text-green-700',
    disputed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="font-black text-white text-lg">ChamaAi <span className="text-primary text-sm font-bold">Admin</span></span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-white/60">
            <Link href="/admin" className="text-white font-bold">Dashboard</Link>
            <Link href="/admin/providers" className="hover:text-white transition-colors">Prestadores</Link>
            <Link href="/admin/orders" className="hover:text-white transition-colors">Pedidos</Link>
            <Link href="/admin/disputes" className="hover:text-white transition-colors">Disputas</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="mb-10 space-y-1">
          <h1 className="text-3xl font-black text-white">Backoffice <span className="text-primary">ChamaAi</span></h1>
          <p className="text-white/50">Visão geral da operação em tempo real.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-white/5 border-white/10 text-white overflow-hidden relative group hover:bg-white/10 transition-colors">
              <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full opacity-30 blur-xl group-hover:opacity-50 transition-opacity" />
              <CardContent className="p-5 space-y-3">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-xs text-white/50 mt-0.5">{stat.label}</p>
                </div>
                <Badge variant="outline" className="border-white/10 text-white/50 text-[10px]">{stat.change}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders Table */}
        <Card className="bg-white/5 border-white/10 text-white overflow-hidden">
          <CardHeader className="border-b border-white/10 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-white">Pedidos Recentes</CardTitle>
            <Link href="/admin/orders">
              <Badge variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer">
                Ver todos →
              </Badge>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/5">
                  <tr className="text-white/40 text-xs uppercase tracking-widest font-bold">
                    <th className="text-left px-6 py-4">Serviço</th>
                    <th className="text-left px-6 py-4">Cliente</th>
                    <th className="text-left px-6 py-4">Bairro</th>
                    <th className="text-left px-6 py-4">Status</th>
                    <th className="text-left px-6 py-4">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders?.map((order: any) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-medium">
                        {order.service_categories?.icon} {order.service_categories?.name || 'Geral'}
                      </td>
                      <td className="px-6 py-4 text-white/60">{order.client_name}</td>
                      <td className="px-6 py-4 text-white/60">{order.neighborhood}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${statusColor[order.status] || 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/40 text-xs">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
