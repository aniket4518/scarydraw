# ── Single stage: install + build + run ─────────────────────
FROM node:20-alpine
RUN npm install -g pnpm@9.0.0
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/common/package.json            ./packages/common/
COPY packages/db/package.json                ./packages/db/
COPY apps/frontend/package.json              ./apps/frontend/

RUN pnpm install --frozen-lockfile

COPY packages/ ./packages/
COPY apps/frontend/ ./apps/frontend/

# NEXT_PUBLIC_ vars are baked into JS at build time
ARG NEXT_PUBLIC_HTTP_BACKEND_URL
ARG NEXT_PUBLIC_WS_BACKEND_URL
ENV NEXT_PUBLIC_HTTP_BACKEND_URL=$NEXT_PUBLIC_HTTP_BACKEND_URL
ENV NEXT_PUBLIC_WS_BACKEND_URL=$NEXT_PUBLIC_WS_BACKEND_URL

RUN pnpm --filter @repo/db exec prisma generate
RUN pnpm --filter frontend build

# Manually create the top-level @repo/db link
RUN mkdir -p node_modules/@repo && \
    ln -s /app/packages/db node_modules/@repo/db

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

# Run standard next start instead of standalone to avoid pnpm symlink issues
CMD ["pnpm", "--filter", "frontend", "start"]
