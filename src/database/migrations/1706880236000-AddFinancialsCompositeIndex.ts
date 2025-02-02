import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFinancialsCompositeIndex1706880236000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add composite index for optimizing the getAllFinancialsWithStocks query
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_financials_stock_report_date ON public.financials(stock_id, report_date DESC)`
    );

    // Add comment explaining the purpose of the index
    await queryRunner.query(
      `COMMENT ON INDEX public.idx_financials_stock_report_date IS 'Optimizes queries that fetch financial data ordered by stock_id and report_date, particularly for the EPS growth ranking calculation'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS public.idx_financials_stock_report_date`
    );
  }
}
