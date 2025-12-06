FROM oven/bun:latest AS builder
WORKDIR /app

COPY ../../bun.lockb ../../package.json ./

RUN bun install

COPY ../../ .

WORKDIR /app/apps/frontend
RUN bun install

RUN bun run build

FROM oven/bun:latest AS prod
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/apps/frontend/dist ./dist

CMD ["bun", "serve", "dist"]
