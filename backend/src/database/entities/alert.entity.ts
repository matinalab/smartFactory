import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  time: Date;

  @Column({ length: 255 })
  message: string;

  @Column({ 
    type: 'enum', 
    enum: ['info', 'warning', 'error'],
    default: 'info'
  })
  level: string;

  @Column({ length: 50, nullable: true, name: 'device_id' })
  deviceId: string;

  @Column({ length: 50, nullable: true, name: 'area_id' })
  areaId: string;

  @Column({ type: 'boolean', default: false, name: 'is_read' })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

