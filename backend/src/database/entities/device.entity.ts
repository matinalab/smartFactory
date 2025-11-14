import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Area } from './area.entity';

@Entity('devices')
export class Device {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ length: 50, name: 'area_id' })
  areaId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  type: string;

  @Column({ 
    type: 'enum', 
    enum: ['running', 'idle', 'error', 'warning'],
    default: 'idle'
  })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'grid_x' })
  gridX: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'grid_y' })
  gridY: number;

  @Column({ type: 'int', default: 0 })
  efficiency: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  temperature: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'animation_x' })
  animationX: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'animation_y' })
  animationY: number;

  @ManyToOne(() => Area, area => area.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'area_id' })
  area: Area;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

