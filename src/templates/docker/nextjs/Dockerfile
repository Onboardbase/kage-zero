# Start with the base Node.js 20 Alpine image
FROM node:20-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
# Install libc6-compat if needed for certain Node.js packages
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else yarn; \
  fi

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set the telemetry flag to disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Run the build command to compile your Next.js application
RUN yarn build

# 3. Production image, copy all the files and run Next.js
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the necessary files for running the application
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port your Next.js app will run on
EXPOSE $PORT

ENV PORT $PORT
ENV HOSTNAME "0.0.0.0"

# Install sharp for image optimization
RUN apk add --no-cache vips
RUN yarn global add sharp

# Start the application using node server.js
CMD ["node", "server.js"]
