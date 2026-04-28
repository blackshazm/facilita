import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const PLATFORM_FEE_PERCENTAGE = 0.20; // 20% taxa da plataforma conforme sugerido no PRD (menos de 50%)

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "OrderId é obrigatório" }, { status: 400 });
    }

    // 1. Buscar detalhes do pedido
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    // 2. Verificar se já existe uma transação capturada ou autorizada para evitar duplicidade
    const { data: existingTx } = await supabase
      .from("transactions")
      .select("id")
      .eq("order_id", orderId)
      .in("status", ["captured", "authorized"])
      .maybeSingle();

    if (existingTx) {
      return NextResponse.json({ error: "Pagamento já processado para este pedido" }, { status: 400 });
    }

    // Usar price_final se disponível, senão price_estimate
    const amountTotal = order.price_final || order.price_estimate;
    
    if (!amountTotal) {
      return NextResponse.json({ error: "O valor final do serviço ainda não foi definido pelo profissional." }, { status: 400 });
    }

    const platformFee = Number((amountTotal * PLATFORM_FEE_PERCENTAGE).toFixed(2));
    const providerAmount = Number((amountTotal - platformFee).toFixed(2));

    // 3. Criar registro de transação (status inicial: pending)
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        order_id: orderId,
        client_id: order.client_id,
        provider_id: order.provider_id,
        amount_total: amountTotal,
        platform_fee: platformFee,
        provider_amount: providerAmount,
        status: "pending",
        payment_method: "card",
        gateway_data: {
          mock_note: "Em um cenário real, aqui seria gerado o PaymentIntent do Stripe ou o pedido no Pagar.me"
        }
      })
      .select()
      .single();

    if (txError) {
      console.error("Erro ao criar transação:", txError);
      return NextResponse.json({ error: "Falha ao registrar a intenção de pagamento no banco." }, { status: 500 });
    }

    // 4. Retornar mock de resposta de checkout
    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      amount: amountTotal,
      clientSecret: "mock_secret_" + Math.random().toString(36).substring(7),
      message: "Intent de pagamento gerado com sucesso."
    });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
