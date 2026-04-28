import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    
    // Validate authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })

    const body = await req.json()
    const { orderId, beforePhotos, afterPhotos, environmentClean, testedWithClient, notes } = body

    if (!orderId || !beforePhotos || !afterPhotos || environmentClean === undefined || testedWithClient === undefined) {
      return NextResponse.json({ success: false, error: 'Dados incompletos no checklist' }, { status: 400 })
    }

    // Security check: Provider must own the order and it must be in progress
    const { data: order } = await supabase
      .from('orders')
      .select('provider_id, status')
      .eq('id', orderId)
      .single()

    if (!order || order.provider_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Pedido não encontrado ou sem permissão' }, { status: 404 })
    }

    if (order.status !== 'in_progress') {
      return NextResponse.json({ success: false, error: 'O pedido não está em andamento.' }, { status: 400 })
    }

    // 1. Insert Checklist
    const { error: checklistError } = await supabase
      .from('order_checklists')
      .insert({
        order_id: orderId,
        provider_id: user.id,
        before_photos: beforePhotos,
        after_photos: afterPhotos,
        environment_clean: environmentClean,
        tested_with_client: testedWithClient,
        notes: notes || ''
      })

    if (checklistError) {
      // If error is duplicate key, it means checklist was already submitted
      if (checklistError.code === '23505') {
        return NextResponse.json({ success: false, error: 'Checklist já enviado para este pedido.' }, { status: 400 })
      }
      throw checklistError
    }

    // 2. Update Order Status
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: 'completed_provider' })
      .eq('id', orderId)

    if (orderError) throw orderError

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error submitting checklist:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
