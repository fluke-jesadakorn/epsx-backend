-- Create exchanges table
CREATE TABLE IF NOT EXISTS public.exchanges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    market_code TEXT NOT NULL UNIQUE,
    exchange_name TEXT NOT NULL,
    country TEXT NOT NULL,
    currency TEXT,
    stocks TEXT,
    exchange_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stocks table
CREATE TABLE IF NOT EXISTS public.stocks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    symbol TEXT NOT NULL,
    company_name TEXT NOT NULL,
    exchange_id UUID NOT NULL REFERENCES public.exchanges(id),
    market_code TEXT NOT NULL,
    exchange_name TEXT NOT NULL,
    country TEXT NOT NULL,
    currency TEXT,
    stocks TEXT,
    exchange_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol, exchange_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_exchanges_market_code ON public.exchanges(market_code);
CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON public.stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_stocks_exchange_id ON public.stocks(exchange_id);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exchanges_updated_at
    BEFORE UPDATE ON public.exchanges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stocks_updated_at
    BEFORE UPDATE ON public.stocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant appropriate permissions
GRANT ALL ON public.exchanges TO postgres, service_role;
GRANT ALL ON public.stocks TO postgres, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
