# 🧠 Master Prompt: FACILITA - Marketplace de Serviços Domésticos

*Use este prompt para contextualizar novas IAs, desenvolvedores ou stakeholders sobre o funcionamento completo da plataforma FACILITA.*

---

## 🎯 1. Visão Geral e Posicionamento
**Nome do Produto:** FACILITA
**O que é:** Um marketplace transacional fechado para serviços domésticos multi-verticais (Elétrica, Hidráulica, Pintura, Reparos e Montagem).
**Problema:** Assimetria de informação, informalidade, falta de garantia e insegurança na contratação de profissionais de manutenção residencial.
**Solução:** Uma plataforma que controla a jornada de ponta a ponta: triagem do problema, match com profissional verificado, execução padronizada, pagamento com split automático e mediação de disputas.

## 🏗️ 2. Arquitetura e Tech Stack (Modular Monolith)
O projeto segue uma arquitetura baseada em Monorepo e Monólito Modular para equilibrar velocidade de entrega com escalabilidade futura.
*   **Web (Admin/Cliente):** Next.js 15 (App Router) + Tailwind CSS + Shadcn UI.
*   **Mobile (Cliente/Prestador):** React Native + Expo.
*   **Backend:** NestJS (TypeScript).
*   **Banco de Dados:** PostgreSQL (gerenciado via Supabase).
*   **Cache e Filas:** Redis + BullMQ (para automações e push notifications).
*   **Design System:** "Emerald Light" (Baseado na regra 60-30-10: 60% Fundo #EAF0F6, 30% Cards #FFFFFF, 10% CTA #10B981).

## 👥 3. Atores do Sistema
1.  **Cliente:** Solicita o serviço, aprova orçamentos, paga na plataforma e avalia.
2.  **Prestador (Profissional):** Passa por KYC rigoroso, recebe leads qualificados, executa o serviço e envia evidências de conclusão.
3.  **Backoffice (Admin):** Modera disputas, aprova cadastros (KYC) e monitora fraudes.

## 🔄 4. O Fluxo de Negócio (Caminho Feliz)
1.  **Triagem Guiada:** O Cliente escolhe a categoria (ex: Elétrica) e o problema específico. O app exige fotos e detalhes mínimos.
2.  **Precificação/Orçamento Base:** O sistema exibe um preço base ou uma faixa de valor estimada.
3.  **Match Inteligente:** O sistema notifica os Prestadores mais próximos com o melhor *Score* operacional e disponibilidade (Fila de Oportunidades).
4.  **Aceite e Deslocamento:** O Prestador aceita o *job*. O Cliente acompanha o status em tempo real.
5.  **Adicionais (Crucial):** Se no local o Prestador identificar que o escopo é maior, ele envia uma solicitação formal de **Adicional** pelo app (com fotos). O Cliente precisa dar o "Aceite Digital".
6.  **Execução e Evidência:** O Prestador finaliza o serviço e faz upload das fotos do "Depois" e preenche um checklist.
7.  **Pagamento e Encerramento:** O pagamento (cartão pré-autorizado ou Pix) é capturado. O Cliente aprova a conclusão.
8.  **Repasse (Split):** O sistema retém o *Take Rate* da FACILITA e agenda o repasse para a carteira do Prestador.

## 🛡️ 5. Regras de Ouro (Business Rules)
*   **Off-Platform é proibido:** Fechar negócio por fora resulta em suspensão de contas e anulação imediata da garantia. O chat possui filtros automáticos para barrar envio de PIX externo ou números de WhatsApp.
*   **Garantia vinculada ao App:** A FACILITA só garante problemas se a transação financeira ocorreu dentro da plataforma.
*   **Evidência é Rei:** Não existe conclusão de serviço nem pagamento liberado sem o envio de provas fotográficas pelo Prestador.
*   **KYC (Know Your Customer) Obrigatório:** Prestadores não recebem serviços até terem documentos, fotos e antecedentes validados.

## 📊 6. Motor Antifraude Integrado
*   **Prevenção de Conluio:** Monitoramento de padrões onde o mesmo Cliente sempre chama o mesmo Prestador.
*   **Falsos Adicionais:** Alertas no Backoffice se um Prestador pede "Adicional" em mais de 40% das suas visitas.
*   **Chargeback Protection:** O repasse do prestador só ocorre após a consolidação do pagamento do cliente, mitigando fraudes de cartão clonado.

---
**Instrução à IA / Dev:** A partir de agora, todas as funcionalidades, telas ou códigos que você desenvolver devem respeitar essa estrutura, focando em segurança transacional, mitigação de fraudes e retenção do usuário dentro do ecossistema FACILITA.
