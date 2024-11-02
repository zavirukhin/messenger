import { User } from './src/auth/entity/user.entity';
import { UserInit1730566248080 } from './src/migrations/1730566248080-UserInit';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'sa',
  database: 'postgres',
  logging: true,
  synchronize: false,
  migrationsRun: false,
  entities: [User],
  migrations: [UserInit1730566248080],
};

export const AppDataSource = new DataSource(dataSourceOptions);
