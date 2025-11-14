import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 在文件顶部加载.env配置
dotenv.config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'smartfactory_db',
  entities: [path.join(__dirname, '../database/entities/*.entity{.ts,.js}')],
  synchronize: true, // 生产环境应设为false
  logging: true,
  charset: 'utf8mb4',
};

