import { MigrationInterface } from 'typeorm';
import { MongoQueryRunner } from 'typeorm/driver/mongodb/MongoQueryRunner';

export class InitialMigration1707123159845 implements MigrationInterface {
    public async up(queryRunner: MongoQueryRunner): Promise<void> {
        // Get MongoDB database instance
        const db = (queryRunner as any).databaseConnection;

        // Create collections
        await db.createCollection('exchanges');
        await db.createCollection('stocks');
        await db.createCollection('financials');

        // Create indexes for exchanges collection
        await db.collection('exchanges').createIndexes([
            {
                key: { market_code: 1 },
                unique: true
            },
            {
                key: { country: 1 }
            },
            {
                key: { active: 1 }
            }
        ]);

        // Create indexes for stocks collection with explicit names
        await db.collection('stocks').createIndexes([
            {
                key: { symbol: 1 },
                name: 'idx_stocks_symbol',
                unique: true
            },
            {
                key: { company_name: 1 },
                name: 'idx_stocks_company_name'
            },
            {
                key: { sector: 1 },
                name: 'idx_stocks_sector'
            },
            {
                key: { market_code: 1 },
                name: 'idx_stocks_market_code'
            },
            {
                key: { 'exchanges.market_code': 1 },
                name: 'idx_stocks_exchanges_market_code'
            }
        ]);

        // Create indexes for financials collection
        await db.collection('financials').createIndexes([
            {
                key: { stock_id: 1, report_date: -1 }
            },
            {
                key: { report_date: -1 }
            },
            {
                key: { stock_id: 1, fiscal_year: -1, fiscal_quarter: -1 }
            },
            {
                key: { eps_diluted: 1 }
            }
        ]);
    }

    public async down(queryRunner: MongoQueryRunner): Promise<void> {
        // Drop collections in reverse order
        const db = (queryRunner as any).databaseConnection;
        await db.dropCollection('financials');
        await db.dropCollection('stocks');
        await db.dropCollection('exchanges');
    }
}
