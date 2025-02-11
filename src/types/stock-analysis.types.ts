export interface StockScreenerResponse {
  data: {
    data: Array<{
      s: string; // symbol
      n: string; // name
      [key: string]: any; // other fields
    }>;
    resultsCount: number;
  };
}

// TODO: Add types for:
// - Technical analysis indicators
// - Price analysis
// - Volume analysis
// - Market sentiment analysis
