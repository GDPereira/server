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

CMD ["bunx", "serve", "-s", "dist", "-l", "5173"]
