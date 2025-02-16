export interface StockScreenerResponse {
  data: {
    data: Array<{
      s: string;  // symbol
      n: string;  // company name
      v: number;  // volume
      vw: number; // volume weighted average price
      o: number;  // open
      c: number;  // close
      h: number;  // high
      l: number;  // low
      t: number;  // timestamp
      mc: number; // market cap
    }>;
    resultsCount: number;
    queryTime: number;
  };
  status: string;
  request_id: string;
}

export interface StockDataResponse {
  symbol: string;
  company_name: string;
  current_price: number;
  change_percent: number;
  volume: number;
  market_cap: number;
  pe_ratio?: number;
  dividend_yield?: number;
  last_updated: Date;
}

export interface StockAnalysisResult {
  symbol: string;
  analysis: {
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: number;
    signals: Array<{
      indicator: string;
      signal: 'buy' | 'sell' | 'hold';
      confidence: number;
    }>;
    support_levels: number[];
    resistance_levels: number[];
  };
  timestamp: Date;
}

// TODO: Future enhancements
// - Add support for real-time price updates
// - Add technical analysis indicators
// - Add sentiment analysis
// - Add historical data analysis
// - Add machine learning predictions
// - Add risk metrics
