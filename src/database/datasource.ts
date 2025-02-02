import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Exchange } from '../entities/exchange.entity';
import { Stock } from '../entities/stock.entity';
import { Financial } from '../entities/financial.entity';
import { Event } from '../entities/event.entity';

config(); // Load environment variables

// Using connection URL with SSL for Supabase Postgres
// Note: SSL is required for Supabase connections
// The rejectUnauthorized: false setting is needed to prevent SSL certificate verification issues
export default new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  entities: [Exchange, Stock, Financial, Event],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  ssl: { rejectUnauthorized: false }
});
