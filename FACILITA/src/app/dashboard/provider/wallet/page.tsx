import React from 'react'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  AlertCircle,
  TrendingUp,
  Wallet as WalletIcon
} from 'lucide-react'
import Link from 'next/link'

export default async function ProviderWalletPage() {
  const supabase = await createServerSupabase()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  // Verifica se o usuário é prestador e está no perfil correto
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'provider') {
    return redirect('/dashboard')
  }

  // 1. Buscar dados da Carteira
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('provider_id', user.id)
    .single()

  // 2. Buscar Transações Recentes com joins para pegar o nome da categoria do serviço
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      orders (
        service_categories (name)
      )
    `)
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        
        {/* Breadcrumb e Título */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="space-y-1">
            <Link href="/dashboard/provider" className="text-primary text-sm font-bold flex items-center gap-1 mb-2 hover:underline">
              ← Voltar ao Painel
            </Link>
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Minha <span className="text-primary italic">Carteira</span>
            </h1>
            <p className="text-muted-foreground text-lg">Acompanhe seus lucros e solicite transferências.</p>
          </div>
          <Button className="rounded-2xl bg-black text-white font-bold h-14 px-10 hover:bg-black/80 shadow-lg transition-all active:scale-95">
            Solicitar Saque
          </Button>
        </div>

        {/* Grid de Cards de Saldo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          <Card className="border-none shadow-2xl bg-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute -top-4 -right-4 p-6 opacity-10">
                <WalletIcon size={120} />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest opacity-70">Saldo Disponível</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-black">{formatCurrency(wallet?.balance_available || 0)}</p>
              <div className="mt-4 flex items-center gap-1.5 py-1 px-3 bg-white/10 rounded-full w-fit">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase">Liberado para Saque</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl bg-white overflow-hidden relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Em Aprovação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-black text-foreground">{formatCurrency(wallet?.balance_pending || 0)}</p>
              <p className="text-[10px] mt-4 font-bold text-muted-foreground uppercase flex items-center gap-1">
                <Clock className="h-3 w-3" /> Processando Ciclo de Garantia
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl bg-white overflow-hidden relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Próximo Fechamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <p className="text-2xl font-black">Quarta-feira</p>
              </div>
              <p className="text-[10px] mt-4 font-bold text-muted-foreground uppercase">Transferência automática do sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Transações */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-3">
            Histórico <span className="text-primary italic">Financeiro</span>
          </h2>

          <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
            {transactions && transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/30 border-b">
                      <th className="p-6 font-black uppercase text-[10px] text-muted-foreground tracking-widest">Data / Ref</th>
                      <th className="p-6 font-black uppercase text-[10px] text-muted-foreground tracking-widest">Serviço Realizado</th>
                      <th className="p-6 font-black uppercase text-[10px] text-muted-foreground tracking-widest">Bruto</th>
                      <th className="p-6 font-black uppercase text-[10px] text-muted-foreground tracking-widest">Taxa Facilita</th>
                      <th className="p-6 font-black uppercase text-[10px] text-muted-foreground tracking-widest text-right">Seu Lucro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted/50">
                    {transactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-muted/10 transition-all">
                        <td className="p-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{new Date(tx.created_at).toLocaleDateString('pt-BR')}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">#{tx.id.split('-')[0].toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-lg">
                                🛠️
                            </div>
                            <span className="font-bold text-sm text-foreground">
                              {tx.orders?.service_categories?.name || 'Serviço sob Demanda'}
                            </span>
                          </div>
                        </td>
                        <td className="p-6 text-sm font-medium">{formatCurrency(tx.amount_total)}</td>
                        <td className="p-6 text-sm text-red-500 font-medium">-{formatCurrency(tx.platform_fee)}</td>
                        <td className="p-6 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-lg font-black text-green-600">{formatCurrency(tx.provider_amount)}</span>
                            <Badge className={`
                                rounded-full border-none capitalize px-2 py-0 text-[9px] font-black
                                ${tx.status === 'captured' ? 'bg-green-100 text-green-700' : 
                                  tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                  'bg-red-100 text-red-700'}
                            `}>
                              {tx.status === 'captured' ? 'Confirmado' : tx.status}
                            </Badge>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-24 text-center">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground opacity-30" />
                </div>
                <p className="text-muted-foreground font-medium">Você ainda não possui transações financeiras registradas.</p>
                <p className="text-xs text-muted-foreground mt-1">Conclua seu primeiro serviço para ver seus lucros aqui!</p>
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
