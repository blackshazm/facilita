import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Webhook para receber notificações do Gateway de Pagamento.
 * Em produção, este endpoint deve validar a assinatura do gateway (ex: Stripe-Signature).
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();

    // Simulação: transactionId e status vindo do gateway
    const { transactionId, status, gatewayData } = body;

    if (!transactionId) {
      return NextResponse.json({ error: "TransactionId não informado" }, { status: 400 });
    }

    // 1. Buscar a transação no nosso banco
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (txError || !tx) {
      return NextResponse.json({ error: "Transação não encontrada localmente" }, { status: 404 });
    }

    // Evitar processar duas vezes a mesma captura
    if (tx.status === "captured") {
      return NextResponse.json({ message: "Transação já foi capturada anteriormente." });
    }

    // 2. Se o status for 'captured' no gateway, atualizamos o sistema
    if (status === "captured") {
      // Atualiza status da transação
      const { error: updateTxError } = await supabase
        .from("transactions")
        .update({ 
          status: "captured",
          gateway_data: { 
            ...tx.gateway_data, 
            ...gatewayData, 
            captured_at: new Date().toISOString() 
          }
        })
        .eq("id", transactionId);

      if (updateTxError) throw updateTxError;

      // Incrementa o saldo pendente da carteira do prestador usando RPC atômica
      const { error: walletError } = await supabase.rpc("increment_wallet_pending", {
        p_provider_id: tx.provider_id,
        p_amount: tx.provider_amount
      });

      if (walletError) {
        console.error("Erro ao atualizar saldo da carteira:", walletError);
      }

      // Atualiza o status do pedido para 'closed' (Encerrado)
      await supabase
        .from("orders")
        .update({ status: "closed" })
        .eq("id", tx.order_id);

      return NextResponse.json({ success: true, message: "Pagamento confirmado e saldo provisionado." });
    }

    // Lógica para falhas de pagamento
    if (status === "failed") {
      await supabase
        .from("transactions")
        .update({ status: "failed" })
        .eq("id", transactionId);
        
      return NextResponse.json({ message: "Transação marcada como falha." });
    }

    return NextResponse.json({ message: "Evento processado sem alterações de estado." });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Erro interno no processamento do webhook" }, { status: 500 });
  }
}
