# Investing Data Scraper

A TypeScript application for scraping and storing investment data from investing.com.

## Project Structure

```
├── src/
│   ├── config/        # Configuration and environment setup
│   ├── services/      # Core services (browser, scraper, database)
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions and helpers
│   └── scripts/       # Utility scripts for data management
├── index.ts          # Main application entry point
└── ...configuration files
```

## Features

- Web scraping with Playwright
- Data storage with Supabase
- Configurable retry mechanisms
- Detailed logging and error handling
- Modular and maintainable architecture
- TypeScript for type safety

## Prerequisites

- Node.js (v16 or higher)
- TypeScript
- Supabase account and project
- Environment variables configured (see `.env.example`)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

## Usage

### Running the Application

Start the main application:
```bash
npm start
```

### Utility Scripts

Fetch data for configured symbols:
```bash
npm run fetch
```

View stored data:
```bash
# View all data
npm run view

# View data for specific symbol
npm run view:symbol AAPL

# View data for specific symbol with custom days
npm run view:symbol AAPL 30
```

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

Build the project:
```bash
npm run build
```

## Future Enhancements

### Web Scraping
- Add support for multiple markets/exchanges
- Implement historical data scraping
- Add proxy rotation system
- Implement parallel scraping
- Add content validation

### Database and Infrastructure
- Implement user authentication
- Add real-time subscriptions
- Add caching layer
- Implement rate limiting
- Add automated backup system
- Implement API versioning

### Data Processing
- Add data normalization
- Implement data verification
- Add support for different data formats
- Add data quality scoring
- Implement trend analysis

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This project is for educational purposes only. Ensure you comply with the terms of service of any websites you interact with.
