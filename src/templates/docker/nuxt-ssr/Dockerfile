FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json ./
COPY yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else yarn; \
  fi

# Copy source
COPY . .

# Build the application
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/.output ./output
COPY --from=builder /app/.nuxt ./.nuxt
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

ENV HOST=0.0.0.0
ENV PORT=$PORT
EXPOSE $PORT

# Start the server using the production build
CMD ["node", ".output/server/index.mjs"]