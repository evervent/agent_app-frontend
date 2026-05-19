import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Agent } from './agent.entity';

export enum TeamType {
  SOLO = 'solo',
  TEAM = 'team',
}

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Agent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @Column({ name: 'agent_id', type: 'uuid', unique: true })
  agentId: string;

  @Column({ name: 'business_name', type: 'varchar', length: 200 })
  businessName: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ name: 'product_interests', type: 'text', array: true, default: [] })
  productInterests: string[];

  @Column({
    name: 'team_type',
    type: 'enum',
    enum: TeamType,
    default: TeamType.SOLO,
  })
  teamType: TeamType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
