FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json bun.lockb turbo.json ./

COPY apps/api/package.json ./apps/api/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/db/package.json ./packages/db/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN bun install

COPY . .

RUN cd packages/db && bunx prisma generate

RUN cd apps/api && bun run build

FROM oven/bun:latest AS prod
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/packages/db ./packages/db

COPY --from=builder /app/apps/api/dist ./dist

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/db/package.json ./packages/db/package.json

CMD ["bun", "dist/src/main.js"]
