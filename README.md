# Investment Data Platform - Microservices Architecture

## Overview

This project is a microservices-based platform for handling investment and stock market data. Built with NestJS and using Bun as the runtime, it provides scalable and efficient data processing capabilities.

## Architecture

The platform consists of several microservices:

- **API Gateway** (Port 3000): Entry point for all client requests
- **Stock Service** (Port 3001): Handles stock-related operations
- **Financial Service** (Port 3002): Processes financial data
- **Exchange Service** (Port 3003): Manages exchange-related operations
- **AI Service** (Port 3004): Provides AI-powered analysis
- **Scheduler Service** (Port 4500): Manages scheduled heavy data processing tasks

## Deployment Options

### Local Development

1. Install dependencies:

```bash
bun install
```

2. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start all services:

```bash
bun run start:all
```

Or start individual services:

```bash
bun run start:gateway
bun run start:stock
bun run start:financial
bun run start:exchange
bun run start:ai
bun run start:scheduler
```

### Distributed Deployment

The Scheduler Service is designed to run on a separate machine to handle heavy data processing tasks without impacting the main application servers.

#### Setting up Scheduler Service on Another Machine

1. Clone the repository on the target machine
2. Create environment file:
```bash
cd apps/scheduler-service
cp .env.example .env
# Configure the service endpoints in .env
```

3. Build and run using Docker:
```bash
# Build the scheduler service image
docker build -t epsx-scheduler -f apps/scheduler-service/Dockerfile .

# Run the container
docker run -d \
  --name epsx-scheduler \
  --env-file apps/scheduler-service/.env \
  -p 4500:4500 \
  epsx-scheduler
```

## Project Structure

```
├── apps/
│   ├── gateway/          # API Gateway service
│   ├── stock/           # Stock data service
│   ├── financial/       # Financial data service
│   ├── exchange/        # Exchange service
│   ├── ai-service/      # AI analysis service
│   └── scheduler-service/ # Scheduled task service
├── libs/
│   └── common/          # Shared code and utilities
└── package.json         # Root package.json
```

## API Documentation

API documentation is available at:

- Swagger UI: http://localhost:3000/docs
- OpenAPI JSON: http://localhost:3000/docs-json

## Development

### Prerequisites

- Bun >= 1.0.0
- MongoDB >= 5.0
- Node.js >= 18 (for development tools)
- Docker (for distributed deployment)

### Running in Development Mode

```bash
# Start all services in development mode
bun run start:dev

# Start individual service in development mode
bun run start:gateway
```

## Testing

```bash
# Run unit tests
bun test

# Run e2e tests
bun test:e2e
```

## Future Enhancements

- [ ] Add WebSocket support for real-time updates
- [ ] Implement caching layer with Redis
- [x] Implement distributed task scheduling
- [ ] Implement circuit breakers for external API calls
- [ ] Add monitoring and alerting
- [ ] Implement data streaming for large datasets
- [ ] Add automated deployment pipeline

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
