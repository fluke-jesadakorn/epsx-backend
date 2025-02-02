import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFinancialsOptimizationIndexes1706880950000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add partial index for data quality
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_financials_valid_eps ON public.financials (stock_id, report_date DESC)
      WHERE eps_diluted IS NOT NULL
    `);

    // Add index for efficient sorting of report dates within stock groups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_financials_stock_date ON public.financials (stock_id, report_date DESC);
    `);

    // Index for the composite unique constraint to improve duplicate checking
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_financials_composite ON public.financials 
      (stock_id, report_date, fiscal_quarter, fiscal_year);
    `);

    // Set statement timeout to avoid long-running queries
    await queryRunner.query(`
      SET statement_timeout = '30s';
    `);

    // Add table partitioning comment for future consideration
    await queryRunner.query(`
      COMMENT ON TABLE public.financials IS 'Consider partitioning by stock_id or report_date range if data volume increases significantly';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_financials_valid_eps`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_financials_stock_date`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_financials_composite`);
    await queryRunner.query(`SET statement_timeout = 0`);
  }
}
