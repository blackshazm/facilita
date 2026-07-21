# Roadmap — Milestone v12.0: App Security Audit & Hardening

## Phase 12.1: Authentication & RBAC Hardening
**Goal**: Revisar e implementar forte controle de acesso e auditoria de ações.
- **Requirements**: AUTH-01, AUTH-02, AUTH-03.
- **Success Criteria**:
    - O fluxo de JWT é seguro (ex: tokens com curta duração e refresh seguro).
    - O RBAC bloqueia estritamente requisições não autorizadas por papel.
    - Todos os acessos e ações críticas são logados com IP e identificação do dispositivo.

## Phase 12.2: Data Protection & Sanitization
**Goal**: Criptografar dados sensíveis e sanitizar inputs para evitar injeções.
- **Requirements**: DATA-01, DATA-02.
- **Success Criteria**:
    - Informações sensíveis de usuários (PII) estão criptografadas em repouso no PostgreSQL.
    - Injeções SQL e tentativas de XSS são bloqueadas pela camada de validação e sanitização (DTOs/Pipes).

## Phase 12.3: Infrastructure Defense & Anti-DDoS
**Goal**: Implementar limitadores de requisição e headers de segurança na API.
- **Requirements**: INFRA-01, INFRA-02.
- **Success Criteria**:
    - A aplicação impõe Rate Limiting global e específico por rotas, bloqueando abusos e Brute Force.
    - Headers de segurança (CORS restrito, CSP, HSTS) estão devidamente configurados nas respostas HTTP.

## Milestone v12.0 Summary
- **Total Phases**: 3
- **Total Requirements**: 7
- **Status**: Not Started
