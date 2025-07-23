# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files and generate lock files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies using npm install instead of npm ci
RUN npm install --production=false
WORKDIR /app/backend
RUN npm install --production=false
WORKDIR /app/frontend  
RUN npm install --production=false

# Build backend
FROM base AS backend-builder
WORKDIR /app/backend
COPY backend/ ./
COPY --from=deps /app/backend/node_modules ./node_modules
RUN npm run build

# Build frontend  
FROM base AS frontend-builder
WORKDIR /app/frontend
COPY frontend/ ./
COPY --from=deps /app/frontend/node_modules ./node_modules
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built applications
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/dist ./dist
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/package*.json ./
COPY --from=deps --chown=nextjs:nodejs /app/backend/node_modules ./node_modules

USER nextjs

EXPOSE 5000

CMD ["node", "dist/server.js"]
