FROM node:20-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Copy service source
COPY apps/scheduler-service ./apps/scheduler-service
COPY libs/common ./libs/common

# Install dependencies
RUN npm install

# Build the application
RUN npm run build:scheduler

# Expose the scheduler service port
EXPOSE 4500

# Set environment variables for production
ENV NODE_ENV=production \
    SCHEDULER_SERVICE_HOST=0.0.0.0 \
    SCHEDULER_SERVICE_PORT=4500

# Command to run the service
CMD ["node", "dist/apps/scheduler-service/main"]
