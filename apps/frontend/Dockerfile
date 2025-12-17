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

RUN bun add serve

COPY --from=builder /app/apps/frontend/dist ./dist

EXPOSE 5173

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
    CMD bun -e "fetch('http://localhost:5173').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bunx", "serve", "-s", "dist", "-l", "tcp://0.0.0.0:5173"]
