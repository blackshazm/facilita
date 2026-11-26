# ==============================================================================
# FACILITA — FRONTEND NEXT.JS 15 STANDALONE PRODUCTION DOCKERFILE
# ==============================================================================

# --- STAGE 1: BUILDER ---
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

# 1. Copiar manifests do monorepo
COPY package.json package-lock.json turbo.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/ui/package.json ./packages/ui/
COPY packages/database/package.json ./packages/database/
COPY packages/event-bus/package.json ./packages/event-bus/
COPY apps/client/package.json ./apps/client/

# 2. Instalar dependências
RUN npm ci

# 3. Copiar pacotes e aplicação cliente
COPY packages/ ./packages/
COPY apps/client/ ./apps/client/

# 4. Gerar Prisma client caso o pacote de contratos/database precise
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# 5. Build dos pacotes compartilhados e do Next.js Standalone
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=@facilita/contracts && \
    npm run build --workspace=@facilita/ui && \
    npm run build --workspace=client

# --- STAGE 2: RUNNER ---
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar os arquivos estáticos e o output standalone
COPY --from=builder /app/apps/client/public ./apps/client/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/.next/static ./apps/client/.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

CMD ["node", "apps/client/server.js"]

