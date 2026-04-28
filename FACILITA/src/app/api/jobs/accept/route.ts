import { createServerSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { orderId } = await req.json()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'provider') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Update the order: assign provider and change status
    const { data, error } = await supabase
      .from('orders')
      .update({
        provider_id: user.id,
        status: 'accepted',
      })
      .eq('id', orderId)
      .is('provider_id', null) // Only allow if not already assigned
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, order: data })
  } catch (error: any) {
    console.error('Accept Job Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
