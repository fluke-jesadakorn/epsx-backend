# Build stage
FROM oven/bun:latest as builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lock ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Copy workspace configuration and packages
COPY apps/*/package*.json ./apps/
COPY apps/*/tsconfig*.json ./apps/

# Install dependencies, npm, and NestJS CLI globally
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    bun install && \
    npm install -g @nestjs/cli && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy source code
COPY . .

# Copy .env.production files for each microservice
COPY apps/ai-service/.env.production ./apps/ai-service/.env.production
COPY apps/exchange/.env.production ./apps/exchange/.env.production 
COPY apps/financial/.env.production ./apps/financial/.env.production
COPY apps/gateway/.env.production ./apps/gateway/.env.production
COPY apps/stock/.env.production ./apps/stock/.env.production

# Build all services with specific output paths
RUN mkdir -p /app/dist/apps && \
    nest build ai-service -p apps/ai-service/tsconfig.json && \
    nest build exchange -p apps/exchange/tsconfig.json && \
    nest build financial -p apps/financial/tsconfig.json && \
    nest build gateway -p apps/gateway/tsconfig.json && \
    nest build stock -p apps/stock/tsconfig.json && \
    ls -la apps/*/dist/ && \
    # Move build outputs to expected location
    for service in ai-service exchange financial gateway stock; do \
    if [ -d "apps/$service/dist" ]; then \
    mv "apps/$service/dist" "/app/dist/apps/$service"; \
    fi \
    done && \
    # Verify build outputs
    ls -la /app/dist/apps/

# Runtime stage
FROM oven/bun:latest
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/bun.lock ./

# Create target directories
RUN mkdir -p ./apps/dist

# Copy dist files with specific paths for each service
COPY --from=builder /app/dist/apps/ai-service ./apps/dist/ai-service
COPY --from=builder /app/dist/apps/stock ./apps/dist/stock
COPY --from=builder /app/dist/apps/financial ./apps/dist/financial
COPY --from=builder /app/dist/apps/exchange ./apps/dist/exchange
COPY --from=builder /app/dist/apps/gateway ./apps/dist/gateway
COPY --from=builder /app/node_modules ./node_modules

# Copy .env.production files
COPY --from=builder /app/apps/ai-service/.env.production ./apps/dist/ai-service/.env.production
COPY --from=builder /app/apps/exchange/.env.production ./apps/dist/exchange/.env.production
COPY --from=builder /app/apps/financial/.env.production ./apps/dist/financial/.env.production
COPY --from=builder /app/apps/gateway/.env.production ./apps/dist/gateway/.env.production
COPY --from=builder /app/apps/stock/.env.production ./apps/dist/stock/.env.production

# Environment setup for inter-service communication
ENV AI_SERVICE_HOST=localhost \
    AI_SERVICE_PORT=4400 \
    STOCK_SERVICE_HOST=localhost \
    STOCK_SERVICE_PORT=4200 \
    FINANCIAL_SERVICE_HOST=localhost \
    FINANCIAL_SERVICE_PORT=4300 \
    EXCHANGE_SERVICE_HOST=localhost \
    EXCHANGE_SERVICE_PORT=4100 \
    PORT=3001

# Expose gateway port
EXPOSE 3001

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
# - Consider multi-stage build optimization for smaller image size
# - Add build args for environment configuration
# - Consider implementing health checks for individual services
# - Add volume mounts for persistent data if needed
