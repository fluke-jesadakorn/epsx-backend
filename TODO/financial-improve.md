# Financial Service Improvements

## Recent Changes (2/19/2025)
- Removed deprecated `scrapeFinancialData` method from FinancialController as this functionality has been migrated to the scheduler service
- Updated CacheService to use the correct configuration path `FinancialConfig.cache.expiry` instead of the deprecated `scraping.cacheExpiry`

## Migration Notes
- Financial data scraping functionality is now handled by the scheduler service
- Scraping configuration has been moved to scheduler service (see apps/scheduler-service/.env)
- Financial service now focuses solely on data querying and aggregation
