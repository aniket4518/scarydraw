# ── Single stage: install + build + run ─────────────────────
FROM node:20-alpine
RUN npm install -g pnpm@9.0.0
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/common/package.json            ./packages/common/
COPY packages/zod/package.json               ./packages/zod/
COPY packages/db/package.json                ./packages/db/
COPY apps/http-backend/package.json          ./apps/http-backend/

RUN pnpm install --frozen-lockfile

COPY packages/ ./packages/
COPY apps/http-backend/ ./apps/http-backend/

# Generate Prisma client, compile @repo/db then the app
RUN pnpm --filter @repo/db exec prisma generate
RUN pnpm --filter http-backend build



RUN npm install -g tsx
ENV NODE_ENV=production
EXPOSE 3001
CMD ["tsx", "apps/http-backend/src/index.ts"]
