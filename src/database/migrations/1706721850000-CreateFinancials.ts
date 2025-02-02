import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFinancials1706721850000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create financials table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.financials (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        stock_id UUID NOT NULL REFERENCES public.stocks(id),
        revenue NUMERIC,
        revenue_growth NUMERIC,
        operations_maintenance NUMERIC,
        selling_general_admin NUMERIC,
        depreciation_amortization NUMERIC,
        goodwill_amortization NUMERIC,
        bad_debts_provision NUMERIC,
        other_operating_expenses NUMERIC,
        total_operating_expenses NUMERIC,
        operating_income NUMERIC,
        interest_expense NUMERIC,
        interest_income NUMERIC,
        net_interest_expense NUMERIC,
        equity_investments_income NUMERIC,
        currency_exchange_gain NUMERIC,
        other_non_operating_income NUMERIC,
        ebt_excluding_unusual NUMERIC,
        gain_on_sale_investments NUMERIC,
        gain_on_sale_assets NUMERIC,
        asset_writedown NUMERIC,
        insurance_settlements NUMERIC,
        other_unusual_items NUMERIC,
        pretax_income NUMERIC,
        income_tax_expense NUMERIC,
        earnings_continuing_ops NUMERIC,
        minority_interest NUMERIC,
        net_income NUMERIC,
        net_income_common NUMERIC,
        net_income_growth NUMERIC,
        shares_basic NUMERIC,
        shares_diluted NUMERIC,
        eps_basic NUMERIC,
        eps_diluted NUMERIC,
        eps_growth NUMERIC,
        free_cash_flow NUMERIC,
        free_cash_flow_per_share NUMERIC,
        dividend_per_share NUMERIC,
        profit_margin NUMERIC,
        free_cash_flow_margin NUMERIC,
        ebitda NUMERIC,
        ebitda_margin NUMERIC,
        depreciation_amortization_ebitda NUMERIC,
        ebit NUMERIC,
        ebit_margin NUMERIC,
        effective_tax_rate NUMERIC,
        report_date TIMESTAMPTZ NOT NULL,
        fiscal_quarter TEXT NOT NULL,
        fiscal_year INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(stock_id, report_date, fiscal_quarter, fiscal_year)
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_financials_stock_id ON public.financials(stock_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_financials_report_date ON public.financials(report_date)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_financials_fiscal_year_quarter ON public.financials(fiscal_year, fiscal_quarter)`);

    // Create trigger
    await queryRunner.query(`
      CREATE TRIGGER update_financials_updated_at
        BEFORE UPDATE ON public.financials
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    // Add table comments
    await queryRunner.query(`
      COMMENT ON TABLE public.financials IS 'Stores detailed financial data for stocks with potential future features:
      - Historical trend analysis
      - Financial ratios calculation
      - Automated financial health scoring
      - Comparative analysis across sectors
      - Real-time financial alerts
      - Custom financial metrics creation'
    `);

    await queryRunner.query(`COMMENT ON COLUMN public.financials.ebitda IS 'Earnings Before Interest, Taxes, Depreciation, and Amortization - Key metric for operational performance analysis'`);
    await queryRunner.query(`COMMENT ON COLUMN public.financials.free_cash_flow IS 'Important for future dividend prediction and company valuation features'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger first
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_financials_updated_at ON public.financials`);
    
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_financials_fiscal_year_quarter`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_financials_report_date`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_financials_stock_id`);
    
    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS public.financials`);
  }
}
