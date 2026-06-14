# Base node image
FROM node:20-alpine AS base

# --- Stage 1: Build Client ---
FROM base AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# --- Stage 2: Build Server & Prisma ---
FROM base AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npx prisma generate

# --- Stage 3: Production Image ---
FROM base AS production
WORKDIR /app

# Copy server dependencies and Prisma generated files
COPY --from=server-build /app/server/node_modules ./server/node_modules
COPY --from=server-build /app/server ./server

# Copy built client to be served by Express
COPY --from=client-build /app/client/dist ./client/dist

# Expose the server port
EXPOSE 3001

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL="file:/app/data/prod.db"

# Ensure the data directory exists for SQLite
RUN mkdir -p /app/data && chown -R node:node /app

# Run as non-root user
USER node

# Start the server (and push the schema before starting)
WORKDIR /app/server
CMD npx prisma db push && npm start
