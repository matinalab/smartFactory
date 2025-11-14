import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('connections')
export class Connection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, name: 'from_area_id' })
  fromAreaId: string;

  @Column({ length: 50, name: 'to_area_id' })
  toAreaId: string;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 50, name: 'component_type' })
  componentType: string;

  @Column({ length: 50, name: 'component_status' })
  componentStatus: string;

  @Column({ length: 100, name: 'component_name' })
  componentName: string;

  @Column({ length: 50, name: 'component_id' })
  componentId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

