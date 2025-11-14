import { Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Device } from './device.entity';

@Entity('areas')
export class Area {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'grid_x' })
  gridX: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'grid_y' })
  gridY: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'grid_width' })
  gridWidth: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'grid_height' })
  gridHeight: number;

  @Column({ 
    type: 'enum', 
    enum: ['normal', 'warning', 'error'],
    default: 'normal'
  })
  status: string;

  @Column({ type: 'int', name: 'device_count', default: 0 })
  deviceCount: number;

  @OneToMany(() => Device, device => device.area, { cascade: true })
  devices: Device[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

