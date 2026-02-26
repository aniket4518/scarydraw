# ── Single stage: install + build + run ─────────────────────
FROM node:20-alpine
RUN npm install -g pnpm@9.0.0
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/common/package.json            ./packages/common/
COPY packages/db/package.json                ./packages/db/
COPY apps/wsbackend/package.json             ./apps/wsbackend/

RUN pnpm install --frozen-lockfile

COPY packages/ ./packages/
COPY apps/wsbackend/ ./apps/wsbackend/

RUN pnpm --filter @repo/db exec prisma generate
RUN pnpm --filter wsbackend build



RUN npm install -g tsx
ENV NODE_ENV=production
EXPOSE 8080
CMD ["tsx", "apps/wsbackend/src/index.ts"]
