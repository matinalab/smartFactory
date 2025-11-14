import { DataSource } from 'typeorm';
import { Area, Device, Connection, Alert } from '../entities';

export async function seedFactoryData(dataSource: DataSource) {
  const areaRepository = dataSource.getRepository(Area);
  const deviceRepository = dataSource.getRepository(Device);
  const connectionRepository = dataSource.getRepository(Connection);
  const alertRepository = dataSource.getRepository(Alert);

  // 清空现有数据（按正确的顺序，避免外键约束问题）
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  await deviceRepository.clear();
  await connectionRepository.clear();
  await areaRepository.clear();
  await alertRepository.clear();
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log('开始导入工厂数据...');

  // 创建区域数据 - 新流程: 料库 -> 投料 -> 生产 + 清洗 -> 灌装 -> 成品库
  const areas = [
    {
      id: 'warehouse',
      name: '料库',
      type: 'storage',
      gridX: 3,
      gridY: 20,
      gridWidth: 8,
      gridHeight: 6,
      status: 'normal',
      deviceCount: 2,
    },
    {
      id: 'feeding',
      name: '投料区',
      type: 'production',
      gridX: 14,
      gridY: 20,
      gridWidth: 8,
      gridHeight: 6,
      status: 'normal',
      deviceCount: 2,
    },
    {
      id: 'production',
      name: '生产车间',
      type: 'production',
      gridX: 25,
      gridY: 20,
      gridWidth: 10,
      gridHeight: 6,
      status: 'normal',
      deviceCount: 3,
    },
    {
      id: 'cleaning',
      name: '清洗区',
      type: 'cleaning',
      gridX: 25,
      gridY: 10,
      gridWidth: 8,
      gridHeight: 6,
      status: 'normal',
      deviceCount: 2,
    },
    {
      id: 'filling',
      name: '灌装区',
      type: 'production',
      gridX: 38,
      gridY: 15,
      gridWidth: 9,
      gridHeight: 8,
      status: 'normal',
      deviceCount: 3,
    },
    {
      id: 'finished_goods',
      name: '成品库',
      type: 'storage',
      gridX: 50,
      gridY: 15,
      gridWidth: 8,
      gridHeight: 8,
      status: 'normal',
      deviceCount: 2,
    },
  ];

  await areaRepository.save(areas);
  console.log(`✓ 已创建 ${areas.length} 个区域`);

  // 创建设备数据
  const devices = [
    // 料库设备
    { id: 'forklift1', areaId: 'warehouse', name: '叉车1', type: 'forklift', status: 'idle', gridX: 5, gridY: 22, efficiency: 85, temperature: 25 },
    { id: 'shelf1', areaId: 'warehouse', name: '货架A区', type: 'shelf', status: 'idle', gridX: 8, gridY: 23, efficiency: 100, temperature: 22 },
    
    // 投料区设备
    { id: 'feeder1', areaId: 'feeding', name: '自动投料机1', type: 'feeder', status: 'running', gridX: 16, gridY: 22, efficiency: 92, temperature: 35 },
    { id: 'conveyor1', areaId: 'feeding', name: '输送带1', type: 'conveyor', status: 'running', gridX: 19, gridY: 22, efficiency: 95, temperature: 32 },
    
    // 生产车间设备
    { id: 'reactor1', areaId: 'production', name: '反应釜1', type: 'reactor', status: 'running', gridX: 28, gridY: 22, efficiency: 88, temperature: 65 },
    { id: 'mixer1', areaId: 'production', name: '搅拌机1', type: 'mixer', status: 'running', gridX: 31, gridY: 22, efficiency: 90, temperature: 45 },
    { id: 'pump1', areaId: 'production', name: '物料泵1', type: 'pump', status: 'running', gridX: 29, gridY: 24, efficiency: 93, temperature: 38 },
    
    // 清洗区设备
    { id: 'washer1', areaId: 'cleaning', name: '清洗机1', type: 'washer', status: 'running', gridX: 27, gridY: 12, efficiency: 87, temperature: 55 },
    { id: 'dryer1', areaId: 'cleaning', name: '烘干机1', type: 'dryer', status: 'idle', gridX: 30, gridY: 12, efficiency: 80, temperature: 48 },
    
    // 灌装区设备
    { id: 'filler1', areaId: 'filling', name: '灌装机1', type: 'filler', status: 'running', gridX: 40, gridY: 18, efficiency: 94, temperature: 42 },
    { id: 'capper1', areaId: 'filling', name: '封盖机1', type: 'capper', status: 'running', gridX: 43, gridY: 18, efficiency: 96, temperature: 35 },
    { id: 'labeler1', areaId: 'filling', name: '贴标机1', type: 'labeler', status: 'running', gridX: 41, gridY: 20, efficiency: 91, temperature: 33 },
    
    // 成品库设备
    { id: 'forklift2', areaId: 'finished_goods', name: '叉车2', type: 'forklift', status: 'idle', gridX: 52, gridY: 18, efficiency: 82, temperature: 26 },
    { id: 'shelf2', areaId: 'finished_goods', name: '成品货架', type: 'shelf', status: 'idle', gridX: 55, gridY: 18, efficiency: 100, temperature: 23 },
  ];

  await deviceRepository.save(devices);
  console.log(`✓ 已创建 ${devices.length} 个设备`);

  // 创建连接线数据 - 按新流程配置
  const connections = [
    {
      fromAreaId: 'warehouse',
      toAreaId: 'feeding',
      type: 'material',
      componentType: 'valve',
      componentStatus: 'running',
      componentName: '原料输送阀V001',
      componentId: 'comp1',
    },
    {
      fromAreaId: 'feeding',
      toAreaId: 'production',
      type: 'material',
      componentType: 'sensor',
      componentStatus: 'normal',
      componentName: '流量传感器F001',
      componentId: 'comp2',
    },
    {
      fromAreaId: 'production',
      toAreaId: 'filling',
      type: 'product',
      componentType: 'pump',
      componentStatus: 'running',
      componentName: '输送泵P001',
      componentId: 'comp3',
    },
    {
      fromAreaId: 'cleaning',
      toAreaId: 'filling',
      type: 'equipment',
      componentType: 'valve',
      componentStatus: 'normal',
      componentName: '清洗供应阀V002',
      componentId: 'comp4',
    },
    {
      fromAreaId: 'filling',
      toAreaId: 'finished_goods',
      type: 'product',
      componentType: 'conveyor',
      componentStatus: 'running',
      componentName: '成品输送线C001',
      componentId: 'comp5',
    },
  ];

  await connectionRepository.save(connections);
  console.log(`✓ 已创建 ${connections.length} 个连接线`);

  // 创建告警数据
  const alerts = [
    { 
      time: new Date('2025-01-29 14:30:25'), 
      message: '反应釜1温度超标', 
      level: 'warning',
      deviceId: 'reactor1',
      areaId: 'production',
      isRead: false,
    },
    { 
      time: new Date('2025-01-29 14:28:10'), 
      message: '灌装机1速度异常', 
      level: 'error',
      deviceId: 'filler1',
      areaId: 'filling',
      isRead: false,
    },
    { 
      time: new Date('2025-01-29 14:25:45'), 
      message: '料库库存预警', 
      level: 'info',
      areaId: 'warehouse',
      isRead: false,
    },
    { 
      time: new Date('2025-01-29 14:20:30'), 
      message: '清洗机1需要维护', 
      level: 'warning',
      deviceId: 'washer1',
      areaId: 'cleaning',
      isRead: false,
    },
    { 
      time: new Date('2025-01-29 14:15:20'), 
      message: '投料机运行正常', 
      level: 'info',
      deviceId: 'feeder1',
      areaId: 'feeding',
      isRead: true,
    },
  ];

  await alertRepository.save(alerts);
  console.log(`✓ 已创建 ${alerts.length} 条告警`);

  console.log('\n✅ 工厂数据导入完成！');
}

