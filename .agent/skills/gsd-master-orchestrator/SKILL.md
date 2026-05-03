---
name: gsd-master-orchestrator
description: "High-integrity GSD Orchestrator for FACILITA. Enforces GSD protocols and Hexagonal Architecture standards."
---

<objective>
The GSD Master Orchestrator is the primary behavioral filter for the Antigravity Agent. It ensures that every user request is processed through the Get Shit Done (GSD) framework, maintaining a 1:1 mapping between intent and documented progress, while strictly enforcing Modular Hexagonal Evolutive architecture.
</objective>

<execution_contexts>
- @.agent/skills/gsd-ns-workflow/
- @.agent/skills/facilita-hexagonal-modular/
- @.planning/PROJECT.md
</execution_contexts>

<routing_logic>
Ao receber QUALQUER solicitação do usuário, siga esta lógica de decisão:

1. **Classificação de Impacto**:
   - **TRIVIAL**: Documentação, ajustes de texto, correções gramaticais. -> Rota: `gsd-fast`.
   - **FUNCIONAL**: Novas rotas, lógica de negócio, alterações de UI. -> Rota: `gsd-progress` (Fase Existente) ou `gsd-phase --add` (Nova Fase).
   - **ESTRUTURAL**: Novos módulos, mudanças no banco, refatoração de infra. -> Rota: `gsd-new-milestone` + `gsd-spec-phase`.

2. **Verificação de Estado**:
   - Se houver uma Fase em progresso no `ROADMAP.md`:
     - Tente encaixar o pedido na fase atual usando `gsd-progress`.
   - Se o pedido for novo e isolado:
     - Crie uma nova fase e inicie o ciclo `Spec -> Discuss -> Plan`.
</routing_logic>

<architectural_enforcement>
- **Mandato Hexagonal**: Toda tarefa `FUNCIONAL` ou `ESTRUTURAL` deve obrigatoriamente invocar a skill `facilita-hexagonal-modular`.
- **Zero-Tolerance for Naked Coding**: É proibido realizar `write_to_file` ou `replace_file_content` em arquivos de código sem que exista um `PLAN.md` que mencione o arquivo.
- **Traceability Tagging**: Todo commit ou alteração deve referenciar o ID da Fase GSD (ex: `[GSD-P2-01]`).
</architectural_enforcement>

<decision_gates>
| Gate | Condição de Aprovação | Ação em caso de Falha |
|------|-----------------------|-----------------------|
| **Spec Gate** | Ambiguidade < 3/10 | Re-executar `gsd-discuss-phase` |
| **Plan Gate** | Arquitetura Hexagonal validada | Replanejar com `facilita-hexagonal-modular` |
| **Secure Gate** | Riscos de Segurança/Privacidade mitigados | Abortar e reportar risco ao usuário |
| **Verify Gate** | Lint Boundary (ESLint) e Testes de Contrato OK | Bloquear conclusão da fase |
</decision_gates>

<process_steps>
1. **INTERCEPT**: Pause o impulso de codificar. Analise o pedido.
2. **CONTEXTUALIZE**: Leia o `PROJECT.md` e o `ROADMAP.md` para situar a tarefa.
3. **ORCHESTRATE**: Dispare a sub-skill do GSD apropriada.
4. **DOCUMENT**: Atualize os artefatos de planejamento ANTES de atualizar o código.
5. **VERIFY**: Execute `npm run lint:boundary` em todos os módulos afetados.
</process_steps>

<fallbacks>
- Se o usuário pedir "urgência/correção rápida": Utilize `gsd-audit-fix` para manter a integridade enquanto resolve o problema rapidamente.
- Se o GSD falhar em um passo: Use `gsd-debug` para diagnosticar o estado do diretório `.planning/`.
</fallbacks>
