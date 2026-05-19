import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Otp, OtpPurpose } from './entities/otp.entity';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const MAX_SENDS_PER_WINDOW = 3;
const RATE_WINDOW_MINUTES = 10;

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(mobile: string, purpose: OtpPurpose): Promise<void> {
    const windowStart = new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000);
    const recentCount = await this.otpRepository.count({
      where: { mobile, purpose, createdAt: MoreThan(windowStart) } as any,
    });

    if (recentCount >= MAX_SENDS_PER_WINDOW) {
      throw new HttpException(
        'Too many OTP requests. Please wait 10 minutes before trying again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const otp = this.otpRepository.create({ mobile, otpCode: code, purpose, expiresAt });
    await this.otpRepository.save(otp);

    // MVP: log to console — swap for real SMS provider (MSG91/Twilio) in v2
    console.log(`[OTP] Mobile: ${mobile} | Purpose: ${purpose} | Code: ${code} | Expires: ${expiresAt.toISOString()}`);
  }

  async verifyOtp(mobile: string, code: string, purpose: OtpPurpose): Promise<void> {
    const otp = await this.otpRepository.findOne({
      where: { mobile, purpose, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new BadRequestException('No active OTP found. Please request a new OTP.');
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired. Please request a new OTP.');
    }

    if (otp.attemptCount >= MAX_ATTEMPTS) {
      throw new BadRequestException('OTP has been invalidated due to too many wrong attempts. Please request a new OTP.');
    }

    if (otp.otpCode !== code) {
      await this.otpRepository.update(otp.id, { attemptCount: otp.attemptCount + 1 });
      const remaining = MAX_ATTEMPTS - (otp.attemptCount + 1);
      throw new BadRequestException(
        `Invalid OTP.${remaining > 0 ? ` ${remaining} attempt(s) remaining.` : ' OTP has been invalidated.'}`,
      );
    }

    await this.otpRepository.update(otp.id, { isUsed: true });
  }
}
