-- TEMPORARY MIGRATION: Disable role-based policies for testing/development
-- WARNING: This removes access restrictions - revert before production use

-- Drop existing policies
DROP POLICY IF EXISTS "Public rate-limited read access to exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Public rate-limited read access to stocks" ON public.stocks;
DROP POLICY IF EXISTS "Tiered access to financials" ON public.financials;

-- Create temporary unrestricted policies
CREATE POLICY "Temporary unrestricted access to exchanges"
    ON public.exchanges
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Temporary unrestricted access to stocks"
    ON public.stocks
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Temporary unrestricted access to financials"
    ON public.financials
    FOR SELECT
    TO public
    USING (true);

-- TODO: To re-enable role-based policies, rerun the previous migration:
-- 20250202041900_enhance_roles_and_policies.sql

COMMENT ON POLICY "Temporary unrestricted access to exchanges" ON public.exchanges IS 'Temporary policy - remember to revert';
COMMENT ON POLICY "Temporary unrestricted access to stocks" ON public.stocks IS 'Temporary policy - remember to revert';
COMMENT ON POLICY "Temporary unrestricted access to financials" ON public.financials IS 'Temporary policy - remember to revert';
