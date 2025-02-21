# Use the Bun base image
FROM oven/bun:1.2.2

# Set working directory and environment variables
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
