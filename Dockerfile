#1: É a instalação de dependências
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

#2: É a Build da aplicação Next.js
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# São as variáveis dummy necessárias apenas para o build estático do Next.js não falhar
ENV DATABASE_URL="postgresql://conecta:conecta_dev@localhost:5433/conecta"
ENV AUTH_SECRET="build-time-secret"
ENV APP_URL="http://localhost:3000"
ENV GOOGLE_CLIENT_ID="build-time-id"
ENV GOOGLE_CLIENT_SECRET="build-time-secret"

RUN npm run build

#3: A imagem final de execução (Produção)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]