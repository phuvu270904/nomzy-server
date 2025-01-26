import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [`${__dirname}/../**/*.entity.{js,ts}`],
  synchronize: false,
  migrations: ['src/migations/*.ts', 'dist/migrations/*.js'],
  cli: {
    migrationsDir: 'src/migrations',
  },
} as TypeOrmModuleOptions;
