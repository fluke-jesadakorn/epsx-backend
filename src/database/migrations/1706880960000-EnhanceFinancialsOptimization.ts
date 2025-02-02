import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceFinancialsOptimization1706880960000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enhanced index for EPS analysis that includes more columns commonly queried together
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_financials_eps_analysis ON public.financials 
      (stock_id, report_date DESC, eps_diluted, eps_basic, net_income)
      WHERE eps_diluted IS NOT NULL;
    `);

    // Index for financial metrics analysis (commonly queried metrics)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_financials_metrics ON public.financials 
      (stock_id, report_date DESC, revenue, net_income, operating_income, free_cash_flow)
      INCLUDE (fiscal_year, fiscal_quarter);
    `);

    // Index for quarterly analysis
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_financials_quarterly ON public.financials 
      (stock_id, fiscal_year DESC, fiscal_quarter DESC, report_date DESC);
    `);

    // Add table partitioning by year
    await queryRunner.query(`
      -- First, create partition function
      CREATE OR REPLACE FUNCTION financials_partition_function() 
      RETURNS TRIGGER AS $$
      DECLARE
        partition_date TEXT;
        partition_name TEXT;
      BEGIN
        partition_date := to_char(NEW.report_date, 'YYYY');
        partition_name := 'financials_' || partition_date;
        
        -- Create the partition if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = partition_name) THEN
          BEGIN
            EXECUTE format(
              'CREATE TABLE IF NOT EXISTS %I PARTITION OF financials 
               FOR VALUES FROM (%L) TO (%L)',
              partition_name,
              partition_date || '-01-01',
              (partition_date::integer + 1)::text || '-01-01'
            );
            
            -- Add same indices to the partition
            EXECUTE format(
              'CREATE INDEX IF NOT EXISTS %I ON %I (stock_id, report_date DESC)',
              'idx_' || partition_name || '_stock_date',
              partition_name
            );
          EXCEPTION WHEN others THEN
            -- Log error but continue execution
            RAISE NOTICE 'Error creating partition %: %', partition_name, SQLERRM;
          END;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger for partition management
    await queryRunner.query(`
      CREATE TRIGGER financials_partition_trigger
      BEFORE INSERT ON financials
      FOR EACH ROW
      EXECUTE FUNCTION financials_partition_function();
    `);

    // Add configuration for autovacuum to maintain index efficiency
    await queryRunner.query(`
      ALTER TABLE financials SET (
        autovacuum_vacuum_scale_factor = 0.05,
        autovacuum_analyze_scale_factor = 0.02
      );
    `);

    // Comment explaining the optimizations
    await queryRunner.query(`
      COMMENT ON TABLE public.financials IS '
        Table is optimized for:
        1. EPS analysis with partial index on non-null eps_diluted
        2. Financial metrics analysis with composite index
        3. Quarterly analysis with composite index
        4. Partitioned by year for better query performance
        5. Autovacuum configured for frequent index maintenance
        
        Future considerations:
        - Monitor partition size and adjust strategy if needed
        - Consider materialized views for common aggregations
        - Add more specific indices based on query patterns
      ';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indices
    await queryRunner.query(`DROP INDEX IF EXISTS idx_financials_eps_analysis`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_financials_metrics`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_financials_quarterly`);

    // Remove partition trigger and function
    await queryRunner.query(`DROP TRIGGER IF EXISTS financials_partition_trigger ON financials`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS financials_partition_function`);

    // Reset autovacuum settings
    await queryRunner.query(`
      ALTER TABLE financials SET (
        autovacuum_vacuum_scale_factor = 0.2,
        autovacuum_analyze_scale_factor = 0.1
      );
    `);

    // Remove partitioning comment
    await queryRunner.query(`COMMENT ON TABLE public.financials IS NULL`);
  }
}
