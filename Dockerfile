# STAGE 1: Base Image (Pilih Node 20 versi Alpine yang super ringan)
FROM node:24-alpine AS base

# STAGE 2: Install Dependencies
FROM base AS deps
# Install libc6-compat karena kadang dibutuhkan oleh beberapa package Next.js di Alpine Linux
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Copy package.json dan package-lock.json
COPY package.json package-lock.json* ./
# Install dependencies menggunakan npm ci agar lebih cepat dan konsisten
RUN npm ci

# STAGE 3: Build Aplikasi
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Matikan telemetry Next.js agar build lebih cepat dan nggak ngirim data ke Vercel
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# STAGE 4: Production Server (Image akhir yang akan dijalankan)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Buat user non-root demi keamanan server
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy folder public
COPY --from=builder /app/public ./public

# Copy hasil build mode "standalone" dan atur hak akses ke user nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Gunakan user non-root
USER nextjs

# Buka port 3000
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Jalankan server bawaan Next.js (bukan npm start!)
CMD ["node", "server.js"]