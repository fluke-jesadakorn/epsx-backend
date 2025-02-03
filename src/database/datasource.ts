import { DataSource } from 'typeorm';
import { getAppConfig } from '../config/app.config';

// Using connection URL with SSL for Supabase Postgres
// Note: SSL is required for Supabase connections
const config = getAppConfig();
export default new DataSource(config.database);
