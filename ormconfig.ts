import { User } from './src/auth/entity/user.entity';
import { UserInit1730566248080 } from './src/migrations/1730566248080-UserInit';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: process.env.DB_TYPE as 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: process.env.DB_LOGGING === 'true',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
  entities: [User],
  migrations: [UserInit1730566248080],
};

export const AppDataSource = new DataSource(dataSourceOptions);
