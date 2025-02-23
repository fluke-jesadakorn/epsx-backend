# Use the Bun base image with explicit platform
FROM --platform=linux/amd64 oven/bun:1.2.2

# Common Environment Variables
ENV NODE_ENV=production
ENV MONGODB_URI=mongodb+srv://jesadakorn:g763Mb5p0tmnlqZX@serverlessinstance0.2giidrq.mongodb.net/epsx?retryWrites=true&w=majority&appName=ServerlessInstance0
ENV MONGODB_DB_NAME=epsx

# AI Service Environment Variables
ENV AI_SERVICE_PORT=4400
ENV USE_LOCAL_OLLAMA=false
ENV AI_PROVIDER_TYPE=openrouter
ENV OPENROUTER_API_KEY=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

# Exchange Service Environment Variables
ENV EXCHANGE_SERVICE_HOST=localhost
ENV EXCHANGE_SERVICE_PORT=4100

# Financial Service Environment Variables
ENV PORT=3001
ENV FINANCIAL_SERVICE_PORT=4300
ENV SERVICE_NAME=FINANCIAL_SERVICE_PORT
ENV SERVICE_HOST=localhost
ENV MAX_RETRY_ATTEMPTS=3
ENV INITIAL_RETRY_DELAY=500
ENV MAX_RETRY_DELAY=5000
ENV MAX_CONCURRENT_REQUESTS=5
ENV BATCH_DELAY=0
ENV PAGE_SIZE=100

# Scheduler Service Environment Variables
ENV SCHEDULER_SERVICE_HOST=localhost
ENV SCHEDULER_SERVICE_PORT=4500
ENV FINANCIAL_SERVICE_HOST=financial-service

# Stock Service Environment Variables
ENV STOCK_SERVICE_PORT=4200

# Gateway Service Environment Variables
ENV STOCK_SERVICE_HOST=localhost
ENV AI_SERVICE_HOST=localhost
ENV FINANCIAL_SERVICE_HOST=localhost

# Set working directory
WORKDIR /app

# Copy package files for workspace and all apps/libs
COPY package.json bun.lock ./
COPY apps/*/package.json ./apps/
COPY libs/*/package.json ./libs/

# Create necessary directories to avoid COPY errors
RUN mkdir -p apps/ai-service apps/exchange apps/financial apps/gateway apps/stock apps/scheduler libs/common

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build all services
RUN bun run build:all

# Expose the port
EXPOSE 3001

# Set the entrypoint
ENTRYPOINT ["bun", "start:all"]
