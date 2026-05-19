import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum OtpPurpose {
  SIGNUP = 'signup',
  SIGNIN = 'signin',
}

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 15 })
  mobile: string;

  @Column({ name: 'otp_code', type: 'varchar', length: 6 })
  otpCode: string;

  @Column({
    type: 'enum',
    enum: OtpPurpose,
  })
  purpose: OtpPurpose;

  @Column({ name: 'expires_at', type: 'timestamp with time zone' })
  expiresAt: Date;

  @Column({ name: 'is_used', type: 'boolean', default: false })
  isUsed: boolean;

  @Column({ name: 'attempt_count', type: 'int', default: 0 })
  attemptCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
