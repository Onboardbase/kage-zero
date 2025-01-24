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

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose the port your Next.js app will run on
EXPOSE $PORT

ENV PORT $PORT
ENV HOSTNAME "0.0.0.0"

# Install sharp for image optimization
RUN apk add --no-cache vips
RUN yarn global add sharp

# Command to run the application
CMD ["yarn", "start"]