# ==============================================================================
# FACILITA — BACKEND NESTJS PRODUCTION DOCKERFILE (MULTI-STAGE)
# ==============================================================================

# --- STAGE 1: BUILDER ---
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl python3 make g++

# 1. Copiar manifests de dependências do monorepo
COPY package.json package-lock.json turbo.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/database/package.json ./packages/database/
COPY packages/event-bus/package.json ./packages/event-bus/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/

# 2. Instalar todas as dependências
RUN npm ci

# 3. Copiar código fonte dos pacotes e da API
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# 4. Gerar Prisma Client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# 5. Compilar pacotes compartilhados e API NestJS
RUN npm run build --workspace=@facilita/contracts && \
    npm run build --workspace=@facilita/database && \
    npm run build --workspace=@facilita/event-bus && \
    npm run build --workspace=api

# --- STAGE 2: RUNNER ---
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl curl

ENV NODE_ENV=production
ENV PORT=3333

# Criar usuário não-root por segurança
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copiar arquivos necessários do builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nestjs:nodejs /app/apps/api ./apps/api
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3333/api || exit 1

CMD ["node", "apps/api/dist/main.js"]

