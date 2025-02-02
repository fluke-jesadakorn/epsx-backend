import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExchangesAndStocks1706721840000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create uuid-ossp extension if not exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Drop existing triggers if they exist
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_exchanges_updated_at ON public.exchanges`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_stocks_updated_at ON public.stocks`);

    // Create exchanges table
    await queryRunner.query(`
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
      )
    `);

    // Create stocks table
    await queryRunner.query(`
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
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_exchanges_market_code ON public.exchanges(market_code)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON public.stocks(symbol)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_stocks_exchange_id ON public.stocks(exchange_id)`);

    // Create or replace the update_updated_at_column function
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Create triggers
    await queryRunner.query(`
      CREATE TRIGGER update_exchanges_updated_at
        BEFORE UPDATE ON public.exchanges
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_stocks_updated_at
        BEFORE UPDATE ON public.stocks
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    // Add table comments
    await queryRunner.query(`
      COMMENT ON TABLE public.exchanges IS 'Stores information about stock exchanges'
    `);

    await queryRunner.query(`
      COMMENT ON TABLE public.stocks IS 'Stores information about individual stocks'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers first
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_stocks_updated_at ON public.stocks`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_exchanges_updated_at ON public.exchanges`);
    
    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS public.stocks`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.exchanges`);
    
    // Drop function
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column`);
  }
}
