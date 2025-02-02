-- Enable Row Level Security on all tables
ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financials ENABLE ROW LEVEL SECURITY;

-- Create policies for exchanges table
CREATE POLICY "Allow public read access to exchanges"
    ON public.exchanges
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow service role to manage exchanges"
    ON public.exchanges
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policies for stocks table
CREATE POLICY "Allow public read access to stocks"
    ON public.stocks
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow service role to manage stocks"
    ON public.stocks
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policies for financials table
CREATE POLICY "Allow public read access to financials"
    ON public.financials
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow service role to manage financials"
    ON public.financials
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policies for authenticated users (if needed in the future)
-- Currently all write operations are restricted to service_role

COMMENT ON TABLE public.exchanges IS 'Protected by RLS:
- Public read access
- Write access restricted to service_role
Future enhancements may include:
- Rate limiting for public access
- Granular access control for different user roles
- Audit logging for write operations';

COMMENT ON TABLE public.stocks IS 'Protected by RLS:
- Public read access
- Write access restricted to service_role
Future enhancements may include:
- User watchlists with personalized access
- Premium data access tiers
- Real-time data update permissions';

COMMENT ON TABLE public.financials IS 'Protected by RLS:
- Public read access
- Write access restricted to service_role
Future enhancements may include:
- Premium user access to real-time data
- Custom financial metric permissions
- Historical data access tiers';
