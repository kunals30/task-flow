# ==========================================
# Stage 1: Build and test
# ==========================================
FROM node:22-bookworm-slim AS build

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       python3 \
       make \
       g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run typecheck \
    && npm test \
    && npm run build


# ==========================================
# Stage 2: Production
# ==========================================
FROM node:22-bookworm-slim AS production

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/app/data/taskflow.db

WORKDIR /app

# Copy production dependencies with the native module
# already compiled in the build stage.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist

# Keep only production dependencies
RUN npm prune --omit=dev \
    && npm cache clean --force \
    && mkdir -p /app/data \
    && chown -R node:node /app

USER node

EXPOSE 3001

CMD ["node", "dist/server/index.js"]
