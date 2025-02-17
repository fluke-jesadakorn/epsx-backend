# Build stage
FROM oven/bun:1.2.2-slim AS builder
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json bun.lock ./
COPY libs/common/package.json ./libs/common/
COPY apps/gateway/package.json ./apps/gateway/
COPY apps/stock/package.json ./apps/stock/
COPY apps/financial/package.json ./apps/financial/
COPY apps/exchange/package.json ./apps/exchange/
COPY apps/ai-service/package.json ./apps/ai-service/

# Install dependencies with cache cleaning in same layer
RUN bun install --frozen-lockfile && \
    rm -rf /root/.bun/install/cache

# Copy source files
COPY libs/common ./libs/common
COPY apps ./apps
COPY nest-cli.json tsconfig.json tsconfig.build.json ./

# Build all services
RUN bun run build:common && \
    bun run build:gateway && \
    bun run build:stock && \
    bun run build:financial && \
    bun run build:exchange && \
    bun run build:ai-service && \
    rm -rf node_modules && \
    bun install --production --frozen-lockfile && \
    rm -rf /root/.bun/install/cache

# Production stage
FROM oven/bun:1.2.2-slim
WORKDIR /app

# Install PM2 for process management
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    bun install -g pm2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appgroup && \
    useradd -r -g appgroup -s /bin/false appuser && \
    mkdir -p /app/data && \
    chown -R appuser:appgroup /app

# Copy only the built applications and production dependencies
COPY --from=builder --chown=appuser:appgroup /app/package.json /app/bun.lock ./
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/libs/common/dist ./libs/common/dist

# Create PM2 ecosystem file
RUN echo '{\
  "apps": [\
    {\
      "name": "gateway",\
      "script": "bun",\
      "args": "run start:prod",\
      "cwd": "/app",\
      "env": {\
        "SERVICE": "gateway",\
        "PORT": "8080"\
      }\
    },\
    {\
      "name": "stock",\
      "script": "bun",\
      "args": "run start:prod",\
      "cwd": "/app",\
      "env": {\
        "SERVICE": "stock",\
        "PORT": "3001"\
      }\
    },\
    {\
      "name": "financial",\
      "script": "bun",\
      "args": "run start:prod",\
      "cwd": "/app",\
      "env": {\
        "SERVICE": "financial",\
        "PORT": "3002"\
      }\
    },\
    {\
      "name": "exchange",\
      "script": "bun",\
      "args": "run start:prod",\
      "cwd": "/app",\
      "env": {\
        "SERVICE": "exchange",\
        "PORT": "3003"\
      }\
    },\
    {\
      "name": "ai-service",\
      "script": "bun",\
      "args": "run start:prod",\
      "cwd": "/app",\
      "env": {\
        "SERVICE": "ai-service",\
        "PORT": "3004"\
      }\
    }\
  ]\
}' > /app/ecosystem.config.json

# Use non-root user
USER appuser

# Set environment variables
ENV NODE_ENV=production \
    PORT=8080

# Expose only gateway port for external access
EXPOSE 8080

# Health check for gateway service
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:8080/health || exit 1

# Start all services using PM2
CMD ["pm2-runtime", "start", "/app/ecosystem.config.json"]

# Documentation
LABEL org.opencontainers.image.description="Investing Scraping Service - Multi-service Container\n\
Architecture:\n\
- Gateway Service (Port 8080) - External API endpoint\n\
- Internal Services:\n\
  * Stock Service (Port 3001)\n\
  * Financial Service (Port 3002)\n\
  * Exchange Service (Port 3003)\n\
  * AI Service (Port 3004)\n\
\n\
Required environment variables:\n\
- MONGODB_URI: MongoDB connection string\n\
- OPENAI_API_KEY: OpenAI API key for AI services\n\
\n\
Cloud Run recommendations:\n\
- Memory: 2-4Gi\n\
- CPU: 2-4 CPUs\n\
- Concurrency: 80\n\
- Min Instances: 1\n\
- Max Instances: Based on load"

# Future Features TODO:
# 1. Implement service discovery for better inter-service communication
# 2. Add Redis caching layer shared between services
# 3. Implement circuit breaker pattern for service resilience
# 4. Add centralized logging with structured log format
# 5. Implement distributed tracing across services
# 6. Add Prometheus metrics for all services
# 7. Implement graceful shutdown handling for all services
# 8. Add service-specific health checks
# 9. Implement retry mechanisms for service communication
# 10. Add MongoDB connection pooling per service
