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

export enum VerificationStatus {
  NOT_SUBMITTED = 'not_submitted',
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
}

@Entity('agent_profiles')
export class AgentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Agent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @Column({ name: 'agent_id', type: 'uuid' })
  agentId: string;

  @Column({ name: 'irda_license_number', type: 'varchar', length: 50, nullable: true })
  irdaLicenseNumber: string | null;

  @Column({ name: 'agency_name', type: 'varchar', length: 200, nullable: true })
  agencyName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string | null;

  @Column({ name: 'experience_years', type: 'int', nullable: true })
  experienceYears: number | null;

  @Column({ name: 'product_lines', type: 'text', array: true, nullable: true, default: [] })
  productLines: string[];

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'photograph_url', type: 'varchar', nullable: true })
  photographUrl: string | null;

  @Column({ name: 'pan_number', type: 'varchar', length: 20, nullable: true })
  panNumber: string | null;

  @Column({ name: 'bank_account_number', type: 'varchar', length: 30, nullable: true })
  bankAccountNumber: string | null;

  @Column({ name: 'ifsc_code', type: 'varchar', length: 15, nullable: true })
  ifscCode: string | null;

  @Column({ name: 'gst_number', type: 'varchar', length: 20, nullable: true })
  gstNumber: string | null;

  @Column({ name: 'profile_completion_percentage', type: 'int', default: 0 })
  profileCompletionPercentage: number;

  @Column({
    name: 'pan_verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.NOT_SUBMITTED,
  })
  panVerificationStatus: VerificationStatus;

  @Column({
    name: 'bank_verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.NOT_SUBMITTED,
  })
  bankVerificationStatus: VerificationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
