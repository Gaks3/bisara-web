# Multi-stage Dockerfile untuk Next.js 16 (Standalone Output)
# Menggunakan Node 20 LTS berbasis Alpine Linux untuk ukuran image yang kecil dan efisien

# 1. Base image
FROM node:20-alpine AS base

# 2. Dependencies stage
FROM base AS deps
# libc6-compat diperlukan untuk kompatibilitas beberapa paket di Alpine Linux
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Salin file deklarasi dependensi dan skrip yang dibutuhkan oleh postinstall (copy:wasm)
COPY package.json package-lock.json ./
COPY scripts ./scripts

# Install dependensi secara bersih (sesuai package-lock.json)
RUN npm ci

# 3. Builder stage
FROM base AS builder
WORKDIR /app

# Salin node_modules dari tahap deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Arguments untuk environment variable Next.js (client-side / NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Matikan telemetri Next.js saat proses build
ENV NEXT_TELEMETRY_DISABLED=1

# Pastikan file WASM ONNX runtime tersalin ke public/wasm sebelum build
RUN npm run copy:wasm

# Build aplikasi Next.js (akan menghasilkan folder standalone karena output: 'standalone')
RUN npm run build

# 4. Runner stage (Production image minimalis)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Buat user non-root untuk keamanan kontainer
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Salin folder public (termasuk aset statis dan model/wasm)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Buat direktori cache .next dengan permission user nextjs
RUN mkdir .next && chown nextjs:nodejs .next

# Salin hasil output standalone dan static bundle
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Gunakan non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Jalankan server standalone Next.js
CMD ["node", "server.js"]
