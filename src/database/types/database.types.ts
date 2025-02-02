export interface Exchange {
  id?: string; // UUID type
  market_code: string;
  exchange_name: string;
  country: string;
  currency?: string;
  stocks?: string;
  exchange_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseError {
  message: string;
  code?: string;
  market_code?: string;
  details?: string;
}

export interface DatabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export interface DatabaseParams {
  page?: number;
  limit?: number;
}

export interface Stock extends Exchange {
  id?: string;
  symbol: string;
  company_name: string;
  exchange_id: string;
  exchanges?: {
    market_code: string;
  };
}
