import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('device_logs')
export class DeviceLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, name: 'device_id' })
  deviceId: string;

  @Column({ length: 50 })
  action: string;

  @Column({ length: 50, name: 'old_status' })
  oldStatus: string;

  @Column({ length: 50, name: 'new_status' })
  newStatus: string;

  @Column({ length: 50, nullable: true })
  operator: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

