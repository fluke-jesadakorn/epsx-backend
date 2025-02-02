import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResetMigrations1706880900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the migrations table if it exists
    await queryRunner.query(`DROP TABLE IF EXISTS public.migrations`);
    
    // Create a new migrations table
    await queryRunner.query(`
      CREATE TABLE public.migrations (
        id SERIAL PRIMARY KEY,
        timestamp bigint NOT NULL,
        name character varying NOT NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No down migration needed as this is a one-time reset
  }
}
