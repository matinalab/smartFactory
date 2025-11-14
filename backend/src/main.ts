import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// 确保全局 crypto 对象可用 (Node 16 兼容性)
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = {
    randomUUID: randomUUID
  };
}

// 加载环境变量
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // 启用CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // API前缀
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`\n🚀 服务已启动:`);
  console.log(`   - 地址: http://localhost:${port}`);
  console.log(`   - API: http://localhost:${port}/api`);
  console.log(`   - 数据库: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}\n`);
}

bootstrap();

