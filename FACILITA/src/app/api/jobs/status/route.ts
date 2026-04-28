import { createServerSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { orderId, status, notes, metadata } = await req.json()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'provider') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Update orders table
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'completed_provider' ? { completed_at: new Date().toISOString() } : {}),
        ...(status === 'on_site' ? { started_at: new Date().toISOString() } : {})
      })
      .eq('id', orderId)
      .eq('provider_id', user.id) // Ensure only the assigned provider can update
      .select()
      .single()

    if (error) throw error

    // Log to history
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status,
      changed_by: user.id,
      notes,
      metadata
    })

    return NextResponse.json({ success: true, order: data })
  } catch (error: any) {
    console.error('Job Status Update Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
