# Financial Service to Scheduler Service Migration Plan

## Aggregation Logic to Move

### EPS Growth Calculation
Currently implemented in `apps/financial/src/aggregation.service.ts`, this needs to be moved to scheduler service for periodic processing and database updates.

```typescript
// Pipeline stages to move:
- Lookup stock information
- Lookup exchange information
- Calculate previous EPS using window functions
- Calculate EPS growth percentage
- Group by stock
- Sort by growth percentage
```

### Planned Growth Correlation Implementations

The following unimplemented methods should be moved to scheduler service:

1. Three Quarter EPS Growth Analysis
```typescript
interface ThreeQuarterEPSGrowth {
  symbol: string;
  company_name: string;
  market_code: string;
  quarters: Array<{
    quarter: number;
    year: number;
    eps: number;
    eps_growth: number;
    report_date: string;
  }>;
  average_growth: number;
}
```

2. EPS-Price Growth Correlation
```typescript
interface EPSPriceGrowth {
  symbol: string;
  company_name: string;
  eps_growth: number;
  price_growth: number;
  correlation: number;
  period_start: string;
  period_end: string;
}
```

3. EPS-Volume Growth Correlation
```typescript
interface EPSVolumeGrowth {
  symbol: string;
  company_name: string;
  eps_growth: number;
  volume_growth: number;
  correlation: number;
  period_start: string;
  period_end: string;
}
```

## Database Schema Requirements

The scheduler service needs access to these collections:
- Financial records (financials)
- Stocks
- Exchanges

### Database Optimization

Utilize existing indexes for efficient aggregation:
```typescript
// Relevant existing indexes to leverage
- { stock: 1, report_date: -1 }        // Latest financials by stock
- { stock: 1, fiscal_year: -1, fiscal_quarter: -1 } // Latest quarters by stock
- { eps_diluted: 1, report_date: -1 }  // EPS tracking
- { eps_basic_growth: -1 }             // EPS growth sorting and ranking
```

New indexes to consider adding:
```typescript
// For correlation calculations
- { eps_growth: 1, price_growth: 1 }   // EPS-Price correlation
- { eps_growth: 1, volume_growth: 1 }  // EPS-Volume correlation
- { report_date: 1, market_code: 1 }   // Market-wide analysis
```

### Future Schema Improvements
(Based on existing TODOs in financial.schema.ts)

1. Data Quality & Validation:
   - Add support for different accounting standards (GAAP/IFRS)
   - Include data quality validation rules
   - Track revision history of financial statements

2. Analysis Enhancements:
   - Support quarterly and annual data comparison
   - Include non-GAAP measures
   - Add financial ratio calculations
   - Add analyst estimates comparison

3. Infrastructure:
   - Implement audit logging for calculations
   - Add support for optimistic locking using version field
   - Consider adding tenant ID for multi-tenant support
   - Add migration strategy for schema changes

## Implementation Notes

### Scheduler Configuration

1. Add new environment variables to scheduler service:
```bash
# Scheduler Timing Configuration
EPS_GROWTH_CRON="0 0 * * *"      # Daily at midnight
CORRELATION_CRON="0 0 * * 0"      # Weekly on Sunday
HISTORICAL_AGG_CRON="0 1 * * *"   # Daily at 1 AM

# Performance Configuration
BATCH_SIZE=100                    # Process stocks in batches
MAX_CONCURRENT=5                  # Maximum concurrent operations
RETRY_ATTEMPTS=3                  # Number of retries for failed operations
```

2. Create new scheduled tasks in scheduler service:

```typescript
// In financial-scheduler.service.ts
@Cron(process.env.EPS_GROWTH_CRON || '0 0 * * *')
async calculateEpsGrowthRankings() {
  // Process in batches
  // Store results in eps_growth_rankings collection
}

@Cron(process.env.CORRELATION_CRON || '0 0 * * 0')
async calculateGrowthCorrelations() {
  // Calculate EPS-Price and EPS-Volume correlations
  // Store in growth_correlations collection
}

@Cron(process.env.HISTORICAL_AGG_CRON || '0 1 * * *')
async aggregateHistoricalData() {
  // Process historical data aggregations
  // Update three_quarter_growth collection
}
```

3. Store results in dedicated collections:
   ```typescript
   // Collection schemas
   interface EpsGrowthRanking {
     _id: ObjectId;
     calculation_date: Date;       // When this ranking was calculated
     rankings: EpsGrowthData[];
     metadata: {
       total_stocks: number;
       calculation_duration: number;
     }
   }

   interface GrowthCorrelation {
     _id: ObjectId;
     calculation_date: Date;
     type: 'price' | 'volume';
     correlations: (EPSPriceGrowth | EPSVolumeGrowth)[];
     metadata: {
       period_start: Date;
       period_end: Date;
       total_stocks: number;
     }
   }

   interface ThreeQuarterGrowth {
     _id: ObjectId;
     calculation_date: Date;
     growth_data: ThreeQuarterEPSGrowth[];
     metadata: {
       quarter_end: Date;
       total_stocks: number;
     }
   }
   ```

4. Update financial service to read pre-calculated data:
   - Add TTL indexes for automated cleanup of old calculations
   - Implement fallback to real-time calculation if needed
   - Cache frequently accessed results

## API Changes Needed

1. Move complex aggregation endpoints to scheduler service:
   - /eps-growth
   - /three-quarter-growth
   - /eps-price-correlation
   - /eps-volume-correlation

2. Update financial service endpoints to:
   - Read from pre-calculated collections
   - Focus on data presentation rather than computation
   - Include metadata about last calculation time

## Type Definitions

Ensure these types are shared between services:
```typescript
interface EpsGrowthData {
  symbol: string;
  company_name: string;
  market_code: string;
  eps: number;
  eps_growth: number;
  rank: number;
  last_report_date: string;
}

interface QuarterData {
  quarter: number;
  year: number;
  eps: number;
  eps_growth: number;
  report_date: string;
}

interface ThreeQuarterEPSGrowth {
  symbol: string;
  company_name: string;
  market_code: string;
  quarters: QuarterData[];
  average_growth: number;
}

interface EPSPriceGrowth {
  symbol: string;
  company_name: string;
  eps_growth: number;
  price_growth: number;
  correlation: number;
  period_start: string;
  period_end: string;
}

interface EPSVolumeGrowth {
  symbol: string;
  company_name: string;
  eps_growth: number;
  volume_growth: number;
  correlation: number;
  period_start: string;
  period_end: string;
}
```

## Monitoring and Error Handling

1. Error Handling Strategy:
```typescript
interface CalculationError {
  timestamp: Date;
  operation: string;
  error: string;
  stock?: string;
  retryCount: number;
}

// Store failed calculations for retry
interface FailedCalculation {
  _id: ObjectId;
  type: 'eps_growth' | 'correlation' | 'historical';
  stockId: ObjectId;
  error: string;
  retryCount: number;
  lastAttempt: Date;
  nextRetry: Date;
}
```

2. Monitoring Metrics:
   - Calculation duration
   - Success/failure rates
   - Number of stocks processed
   - Data freshness
   - Resource utilization

3. Alerts:
   - Failed calculations exceeding retry limit
   - Calculation duration anomalies
   - Data staleness warnings
   - Resource bottlenecks

4. Recovery Procedures:
   - Automated retry mechanism with exponential backoff
   - Manual trigger endpoint for failed calculations
   - Data consistency validation jobs
   - Rollback capability for corrupted calculations
