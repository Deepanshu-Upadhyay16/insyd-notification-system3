# Multi-stage build for production deployment
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Build backend
FROM base AS backend-builder
WORKDIR /app
COPY backend/ ./backend/
COPY --from=deps /app/backend/node_modules ./backend/node_modules
WORKDIR /app/backend
RUN npm run build

# Build frontend
FROM base AS frontend-builder
WORKDIR /app
COPY frontend/ ./frontend/
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
WORKDIR /app/frontend
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copy built frontend
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

USER nextjs

EXPOSE 5000

ENV PORT 5000

CMD ["node", "backend/dist/server.js"]
