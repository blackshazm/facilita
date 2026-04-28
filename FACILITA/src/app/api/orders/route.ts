import { createServerSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const orderSchema = z.object({
  category: z.string(),
  description: z.string().min(10),
  urgency: z.enum(['normal', 'urgent', 'emergency']),
  neighborhood: z.string(),
  address: z.string(),
  clientName: z.string(),
  clientPhone: z.string(),
})

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const body = await req.json()
    
    // Validate
    const validated = orderSchema.parse(body)

    // 1. Find category ID by slug
    const { data: category } = await supabase
      .from('service_categories')
      .select('id')
      .eq('slug', validated.category)
      .single()

    // 2. Create the order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        category_id: category?.id,
        description: validated.description,
        urgency: validated.urgency,
        city: 'São Paulo', // Static for MVP
        neighborhood: validated.neighborhood,
        address: validated.address,
        client_name: validated.clientName,
        client_phone: validated.clientPhone,
        status: 'created',
        source: 'web'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error: any) {
    console.error('API Order Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Erro de validação: ' + error.issues[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
