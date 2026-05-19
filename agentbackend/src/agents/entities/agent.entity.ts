import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
} from 'typeorm';

export enum OnboardingStep {
  SIGNUP = 'signup',
  PROFILE = 'profile',
  BUSINESS = 'business',
  WORKSPACE = 'workspace',
  COMPLETE = 'complete',
}

export enum AgentRole {
  OWNER_AGENT = 'owner_agent',
  SUB_AGENT = 'sub_agent',
  SUPPORT_USER = 'support_user',
  VIEWER = 'viewer',
}

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName: string;

  @Column({ name: 'first_name', type: 'varchar', length: 75, nullable: true })
  firstName: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 75, nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar', length: 15, unique: true })
  mobile: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: true })
  email: string | null;

  @Column({ name: 'password_hash', type: 'varchar', nullable: true })
  passwordHash: string | null;

  @Column({ name: 'is_mobile_verified', type: 'boolean', default: false })
  isMobileVerified: boolean;

  @Column({
    name: 'onboarding_step',
    type: 'enum',
    enum: OnboardingStep,
    default: OnboardingStep.SIGNUP,
  })
  onboardingStep: OnboardingStep;

  @Column({
    type: 'enum',
    enum: AgentRole,
    default: AgentRole.OWNER_AGENT,
  })
  role: AgentRole;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
