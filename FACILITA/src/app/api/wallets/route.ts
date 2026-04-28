import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    
    // Recupera o usuário autenticado da sessão
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    // Busca a carteira vinculada ao ID do prestador
    // O RLS já garante que o usuário só veja a própria carteira se não for admin
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("provider_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ 
        error: "Carteira não encontrada. Verifique se seu perfil está configurado como prestador." 
      }, { status: 404 });
    }

    // Opcional: Buscar transações recentes
    const { data: recentTransactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("provider_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      balance_pending: wallet.balance_pending,
      balance_available: wallet.balance_available,
      updated_at: wallet.updated_at,
      recent_transactions: recentTransactions || []
    });

  } catch (error) {
    console.error("Wallet API Error:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao recuperar dados da carteira." }, { status: 500 });
  }
}
