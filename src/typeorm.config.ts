import { DataSource } from 'typeorm';

import { config } from 'dotenv';

config({ path: '.env' });

export default new DataSource({
  type: 'postgres',
  url: process.env.DB_URL,
  ssl: true,
  migrations: ['./dist/migration/*.js'],
  migrationsTableName: 'custom_migration_table',
});
