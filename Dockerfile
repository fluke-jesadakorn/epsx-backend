# Build stage
FROM oven/bun:1.2.2 AS builder
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package.json bun.lock ./
RUN bun install

# Copy full source and build the application in one step
COPY . .
RUN bun install -g rimraf && bun run build

# Production stage
FROM oven/bun:1.2.2-slim AS production
WORKDIR /app

# Copy package files and install only production dependencies
COPY package.json bun.lock ./
RUN bun install --production \
    && rm -rf /root/.bun/cache  # remove any bun cache if exists

# Copy over the built application
COPY --from=builder /app/dist ./dist

# NOTE: In production environment, it's recommended to use environment variables
# instead of .env files for better security. The .env file copying is included
# here for development/testing purposes only.

# Create non-root user using Debian commands
RUN groupadd -r appgroup && \
    useradd -r -g appgroup -s /bin/false appuser && \
    mkdir -p /app/data && \
    chown -R appuser:appgroup /app

# Use non-root user
USER appuser

# Set environment variables
ENV NODE_ENV=production \
    PORT=8080

# Expose the port that Cloud Run will use
EXPOSE 8080

# Volume configuration for data persistence (if needed)
VOLUME ["/app/data"]

# Set platform argument for build
ARG TARGETPLATFORM=linux/amd64

# Start the application
ENTRYPOINT ["bun", "run", "start:prod"]

# Documentation for environment variables and Cloud Run deployment
LABEL org.opencontainers.image.description="Investing Scraping Service\n\
    SECURITY NOTE: In production, use Cloud Run's environment variables or secrets manager\n\
    instead of .env files for sensitive data.\n\n\
    Required environment variables for Cloud Run deployment:\n\
    - MONGODB_URI: MongoDB connection string\n\
    - OPENAI_API_KEY: OpenAI API key for AI services\n\
    \n\
    Optional environment variables:\n\
    - PORT: Application port (default: 8080, automatically set by Cloud Run)\n\
    - HEADLESS_MODE: Set to 'false' to disable headless mode (default: true)\n\
    - DEBUG_MODE: Set to 'true' to enable debug mode (default: false)\n\
    - DEBUG_SLOW_MO: Slowdown time in ms for debug mode (default: 100)\n\
    - LOG_LEVEL: Logging level (default: info)\n\
    - STOCK_MAX_PARALLEL_REQUESTS: Max parallel stock requests (default: 3)\n\
    - STOCK_BATCH_SIZE: Stock batch size (default: 100)\n\
    - STOCK_BATCH_DELAY: Delay between batches in ms (default: 1000)"

# Future Features TODO:
# 1. Consider adding health check configuration for container orchestration
# 2. Implement multi-stage caching for faster builds
# 3. Add support for ARM64 architecture
# 4. Consider implementing Docker layer caching optimization
# 5. Add container security scanning
# 6. Implement MongoDB connection pooling configuration
# 7. Add MongoDB healthcheck before application startup
# 8. Consider adding Redis for caching layer
# 9. Implement rate limiting for AI service calls
# 10. Add monitoring and metrics collection

# Cloud Run deployment notes:
# 1. Health check: Cloud Run will automatically use /health endpoint
# 2. Memory: Set based on your application's needs (recommended: 512Mi to 1Gi)
# 3. CPU: Set based on your application's needs (recommended: 1-2 CPUs)
# 4. Concurrency: Adjust based on your application's capacity (default: 80)
# 5. Max instances: Set based on expected load and budget
# 6. Region: Choose based on your users' location
# 7. Service account: Use least privilege principle
