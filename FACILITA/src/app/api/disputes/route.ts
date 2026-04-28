import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })

    const body = await req.json()
    const { orderId, reasonCategory, description } = body

    if (!orderId || !reasonCategory || !description) {
      return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 })
    }

    // Check order and get provider_amount
    const { data: order } = await supabase
      .from('orders')
      .select('*, transactions(provider_amount)')
      .eq('id', orderId)
      .single()

    if (!order) {
      return NextResponse.json({ success: false, error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Security: Only client or provider of the order can open dispute
    if (order.client_id !== user.id && order.provider_id !== user.id) {
        return NextResponse.json({ success: false, error: 'Acesso negado ao pedido' }, { status: 403 })
    }

    // Calculate frozen amount (amount that provider would receive)
    // If transaction exists, use it. Otherwise, estimate 80% of final price.
    let frozenAmount = 0
    if (order.transactions && order.transactions.length > 0) {
        frozenAmount = order.transactions[0].provider_amount
    } else {
        frozenAmount = (order.price_final || order.price_estimate || 0) * 0.8
    }

    // 1. Create Dispute
    const { error: disputeError } = await supabase
      .from('disputes')
      .insert({
        order_id: orderId,
        opened_by: user.id,
        reason_category: reasonCategory,
        description,
        frozen_amount: frozenAmount,
        status: 'open'
      })

    if (disputeError) throw disputeError

    // 2. Update Order Status to disputed
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: 'disputed' })
      .eq('id', orderId)

    if (orderError) throw orderError

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error creating dispute:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
