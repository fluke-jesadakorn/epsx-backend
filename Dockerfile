# Use Alpine-based image for both stages if possible
FROM oven/bun:1.2.2-alpine AS builder
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package.json bun.lock ./
RUN bun install

# Copy full source and build the application in one step
COPY . .
RUN bun run build

# Production stage
FROM oven/bun:1.2.2-alpine AS production
WORKDIR /app

# Copy package files and install only production dependencies.
COPY package.json bun.lock ./
RUN bun install --production \
    && rm -rf /root/.bun/cache  # remove any bun cache if exists

# Copy over the built application and necessary migration files
COPY --from=builder /app/dist ./dist
COPY src/database/migrations ./src/database/migrations
COPY src/database/datasource.ts ./src/database/datasource.ts

# Create a directory for file-based storage if needed
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Expose the application port
EXPOSE ${PORT}

# Start the application
# Note: Environment variables will be injected by Cloud Run at runtime
CMD ["bun", "run", "start:prod"]

# Documentation for environment variables
LABEL org.opencontainers.image.description="Investing Scraping Service\n\
Required environment variables for deployment:\n\
- POSTGRES_URL: Database connection string\n\
\n\
Optional environment variables:\n\
- HEADLESS_MODE: Set to 'false' to disable headless mode (default: true)\n\
- DEBUG_MODE: Set to 'true' to enable debug mode (default: false)\n\
- DEBUG_SLOW_MO: Slowdown time in ms for debug mode (default: 100)"

# Note: Cloud Run handles its own health checking mechanism via the /health endpoint
# No container-level HEALTHCHECK needed as Cloud Run will probe the application directly
