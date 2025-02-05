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

# Build if using TypeScript
RUN if [ -f tsconfig.json ]; then yarn build; fi

FROM node:20-alpine AS runner

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Non-root user for security
USER node

ENV HOST=0.0.0.0
ENV PORT $PORT
EXPOSE $PORT

CMD ["node", "dist/index.js"]