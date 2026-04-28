import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    
    // Auth & Role check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
      
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const body = await req.json()
    const { disputeId, orderId, resolution, amount } = body

    if (!disputeId || !orderId || !resolution || amount === undefined) {
      return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 })
    }

    // Get order to find provider_id
    const { data: order } = await supabase
      .from('orders')
      .select('provider_id')
      .eq('id', orderId)
      .single()

    if (!order?.provider_id) {
      return NextResponse.json({ success: false, error: 'Pedido ou prestador não encontrado' }, { status: 404 })
    }

    let disputeStatus = ''
    let orderStatus = ''
    let adminNotes = ''

    if (resolution === 'release_funds') {
      // Release funds to provider
      const { error: rpcError } = await supabase.rpc('release_wallet_balance', { 
        p_provider_id: order.provider_id, 
        p_amount: amount 
      })
      if (rpcError) throw rpcError

      disputeStatus = 'dismissed' // Dispute invalid, favor provider
      orderStatus = 'closed'
      adminNotes = 'Disputa encerrada a favor do prestador. Pagamento liberado.'
      
    } else if (resolution === 'refund_client') {
      // Remove from pending without adding to available
      const { error: rpcError } = await supabase.rpc('refund_wallet_pending', { 
        p_provider_id: order.provider_id, 
        p_amount: amount 
      })
      if (rpcError) throw rpcError

      disputeStatus = 'resolved_refund' // Refunded to client
      orderStatus = 'cancelled'
      adminNotes = 'Disputa resolvida a favor do cliente. Pagamento reembolsado.'
    } else {
      return NextResponse.json({ success: false, error: 'Resolução inválida' }, { status: 400 })
    }

    // Update Dispute
    const { error: disputeError } = await supabase
      .from('disputes')
      .update({ 
        status: disputeStatus, 
        resolved_by: user.id, 
        resolution_notes: adminNotes 
      })
      .eq('id', disputeId)

    if (disputeError) throw disputeError

    // Update Order
    const { error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: orderStatus,
        admin_notes: adminNotes
      })
      .eq('id', orderId)

    if (orderError) throw orderError

    // Update Transaction if refund
    if (resolution === 'refund_client') {
        await supabase
            .from('transactions')
            .update({ status: 'refunded' })
            .eq('order_id', orderId)
    } else if (resolution === 'release_funds') {
        await supabase
            .from('transactions')
            .update({ status: 'captured' })
            .eq('order_id', orderId)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error resolving dispute:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
