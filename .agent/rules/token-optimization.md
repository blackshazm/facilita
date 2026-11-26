# Token Optimization & Context Budgeting Standards

Esta regra consolida as melhores práticas de **Redução Extrema de Tokens e Contexto** baseadas nas abordagens:
1. **Domush/antigravity-plugin-context-mode** (Controle estrito de I/O e buscas indexadas);
2. **rizalkr/agy-setup** (Context Guardian, MCPs enxutos e supressão de ruído);
3. **Sn4kyGit/antigravity-project-starter** (Padrão jCodeMunch / Outline-first e OpenSpec).

---

## 1. Regra de Ouro da Leitura (Outline-First / AST First)
- **Nunca ler arquivos extensos (>100 linhas) integralmente** sem antes verificar:
  - O grafo de dependências via `graphify query` ou `gsd-tools graphify query`.
  - A assinatura das funções/classes usando `ctx_search` ou slice com `StartLine` e `EndLine`.
- Se apenas a interface de um módulo for necessária, inspecione somente exports, tipos e interfaces.

---

## 2. Context Guardian para Comandos de Terminal
- **Zero Raw Dumps**: Nunca rodar comandos que gerem saídas descontroladas no transcript do terminal (`cat`, `Get-Content`, `type`, `git log` sem `--oneline -n`, ou testes unitários sem `--silent` / limitadores).
- Em comandos com potencial de saída longa, canalizar para limitadores:
  - PowerShell: `| Select-Object -First 30`
  - Bash: `| head -n 30`
  - Ou delegar para execução controlada via `ctx_execute`.

---

## 3. Gestão Enxuta de MCPs
- Ferramentas MCP ociosas ou específicas de ecossistemas externos (design, cloud pesada) devem operar apenas sob demanda explícita, preservando tokens de definição de ferramentas no prompt base do modelo.
- Sempre consultar o Knowledge Graph local (`graphify-out/graph.json`) para arquitetura e fluxo de chamadas antes de acionar pesquisas amplas na web ou ferramentas externas.

---

## 4. Spec-Driven Architecture (OpenSpec / GSD)
- Qualquer funcionalidade que envolva mais de 2 arquivos deve ser precedida de especificação estruturada (`SPEC.md` / `PLAN.md`).
- Evitar explorações cegas na base de código: navegar do nó raiz identificado no grafo para o arquivo alvo pontual.
