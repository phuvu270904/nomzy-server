import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [`${__dirname}/../**/*.entity.{js,ts}`],
  synchronize: false,
  migrations: ['dist/migrations/*.js'],
  migrationsTableName: 'migrations',
} as TypeOrmModuleOptions;
