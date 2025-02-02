-- Create custom roles for different access levels
CREATE TYPE user_role AS ENUM ('free', 'premium', 'enterprise');

-- Add role column to auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'free';

-- Create function to check if user has premium access
CREATE OR REPLACE FUNCTION auth.is_premium_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('premium', 'enterprise')
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has enterprise access
CREATE OR REPLACE FUNCTION auth.is_enterprise_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'enterprise'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION auth.check_rate_limit(
  user_id UUID,
  request_type TEXT,
  max_requests INTEGER,
  window_minutes INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  recent_requests INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO recent_requests
  FROM request_logs
  WHERE 
    user_id = user_id
    AND request_type = request_type
    AND created_at > NOW() - (window_minutes || ' minutes')::INTERVAL;
  
  RETURN recent_requests < max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create request logs table for rate limiting
CREATE TABLE IF NOT EXISTS public.request_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    request_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_logs_user_time 
ON public.request_logs(user_id, request_type, created_at);

-- Update exchange policies
DROP POLICY IF EXISTS "Allow public read access to exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Allow service role to manage exchanges" ON public.exchanges;

CREATE POLICY "Public rate-limited read access to exchanges"
    ON public.exchanges
    FOR SELECT
    TO public
    USING (
        auth.check_rate_limit(
            auth.uid(),
            'exchange_read',
            CASE
                WHEN auth.is_enterprise_user() THEN 10000
                WHEN auth.is_premium_user() THEN 5000
                ELSE 1000
            END,
            60
        )
    );

CREATE POLICY "Service role full access to exchanges"
    ON public.exchanges
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Update stocks policies
DROP POLICY IF EXISTS "Allow public read access to stocks" ON public.stocks;
DROP POLICY IF EXISTS "Allow service role to manage stocks" ON public.stocks;

CREATE POLICY "Public rate-limited read access to stocks"
    ON public.stocks
    FOR SELECT
    TO public
    USING (
        auth.check_rate_limit(
            auth.uid(),
            'stock_read',
            CASE
                WHEN auth.is_enterprise_user() THEN 10000
                WHEN auth.is_premium_user() THEN 5000
                ELSE 1000
            END,
            60
        )
    );

CREATE POLICY "Service role full access to stocks"
    ON public.stocks
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Update financials policies with tiered access
DROP POLICY IF EXISTS "Allow public read access to financials" ON public.financials;
DROP POLICY IF EXISTS "Allow service role to manage financials" ON public.financials;

CREATE POLICY "Tiered access to financials"
    ON public.financials
    FOR SELECT
    TO public
    USING (
        CASE
            -- Enterprise users get full access
            WHEN auth.is_enterprise_user() THEN true
            -- Premium users get data up to 1 year old
            WHEN auth.is_premium_user() THEN 
                report_date >= NOW() - INTERVAL '1 year'
            -- Free users get data up to 3 months old
            ELSE 
                report_date >= NOW() - INTERVAL '3 months'
        END
        AND
        auth.check_rate_limit(
            auth.uid(),
            'financial_read',
            CASE
                WHEN auth.is_enterprise_user() THEN 10000
                WHEN auth.is_premium_user() THEN 5000
                ELSE 1000
            END,
            60
        )
    );

CREATE POLICY "Service role full access to financials"
    ON public.financials
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant appropriate permissions
GRANT ALL ON public.request_logs TO postgres, service_role;
GRANT USAGE ON TYPE user_role TO postgres, service_role, public;

COMMENT ON TABLE public.request_logs IS 'Tracks API requests for rate limiting';
COMMENT ON TYPE user_role IS 'User subscription tiers: free, premium, enterprise';

-- Future feature comments
COMMENT ON FUNCTION auth.check_rate_limit IS 'Rate limiting function with potential future enhancements:
- Dynamic rate limits based on server load
- Burst allowance for occasional heavy usage
- Custom rate limit profiles per endpoint
- Geographic-based rate limiting';

COMMENT ON FUNCTION auth.is_premium_user IS 'Premium user check with potential future features:
- Time-based trial periods
- Granular feature access control
- Usage-based tier upgrades
- Team/organization-based premium access';

COMMENT ON FUNCTION auth.is_enterprise_user IS 'Enterprise user check with potential future features:
- Multi-tenant access control
- Custom data retention policies
- Dedicated rate limit pools
- Priority API access';
