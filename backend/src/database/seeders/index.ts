import { DataSource } from 'typeorm';
import { databaseConfig } from '../../config/database.config';
import { seedFactoryData } from './factory.seeder';
import * as dotenv from 'dotenv';

dotenv.config();

async function runSeeders() {
  const dataSource = new DataSource({
    ...databaseConfig,
    synchronize: true, // 确保表已创建
  } as any);

  try {
    await dataSource.initialize();
    console.log('✓ 数据库连接成功\n');

    // 运行工厂数据seeder
    await seedFactoryData(dataSource);

    await dataSource.destroy();
    console.log('\n✓ 数据库连接已关闭');
  } catch (error) {
    console.error('❌ Seeder执行失败:', error);
    process.exit(1);
  }
}

runSeeders();

