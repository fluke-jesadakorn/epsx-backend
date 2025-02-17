# Build stage
FROM oven/bun:latest as builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lock ./

# Copy workspace configuration and packages
COPY apps/*/package*.json ./apps/

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build all services
RUN bun run build:all

# Runtime stage
FROM oven/bun:latest
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/node_modules ./node_modules

# Environment setup for inter-service communication
ENV AI_SERVICE_HOST=localhost \
    AI_SERVICE_PORT=4400 \
    STOCK_SERVICE_HOST=localhost \
    STOCK_SERVICE_PORT=4200 \
    FINANCIAL_SERVICE_HOST=localhost \
    FINANCIAL_SERVICE_PORT=4300 \
    EXCHANGE_SERVICE_HOST=localhost \
    EXCHANGE_SERVICE_PORT=4100 \
    PORT=3000

# Expose gateway port
EXPOSE 3000

# Start all services
CMD ["bun", "run", "start:all"]

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Add labels
LABEL org.opencontainers.image.source="https://github.com/yourusername/epsx-backend" \
    org.opencontainers.image.description="EPSX Backend Microservices" \
    org.opencontainers.image.version="1.0.0"

# TODO: Future improvements
# - Add caching layer for dependencies
# - Implement graceful shutdown
# - Add monitoring and tracing capabilities
# - Configure rate limiting
