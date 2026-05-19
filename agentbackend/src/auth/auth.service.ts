import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { Agent, OnboardingStep } from '../agents/entities/agent.entity';
import { AgentProfile } from '../agents/entities/agent-profile.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { OtpService } from '../otp/otp.service';
import { OtpPurpose } from '../otp/entities/otp.entity';

import { SignupDto } from './dto/signup.dto';
import { VerifySignupOtpDto } from './dto/verify-signup-otp.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { SigninOtpDto } from './dto/signin-otp.dto';
import { SigninPasswordDto } from './dto/signin-password.dto';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(AgentProfile)
    private readonly profileRepository: Repository<AgentProfile>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
  ) {}

  // ─── SIGNUP ────────────────────────────────────────────────────────────────

  async signup(dto: SignupDto): Promise<{ message: string }> {
    const existingMobile = await this.agentRepository.findOne({ where: { mobile: dto.mobile } });
    if (existingMobile) {
      throw new ConflictException('An account with this mobile number already exists.');
    }

    if (dto.email) {
      const existingEmail = await this.agentRepository.findOne({ where: { email: dto.email } });
      if (existingEmail) {
        throw new ConflictException('An account with this email already exists.');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const nameParts = dto.fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;

    const agent = this.agentRepository.create({
      fullName: dto.fullName,
      firstName,
      lastName,
      mobile: dto.mobile,
      email: dto.email ?? null,
      passwordHash,
      isMobileVerified: false,
      onboardingStep: OnboardingStep.SIGNUP,
    });
    await this.agentRepository.save(agent);

    await this.otpService.sendOtp(dto.mobile, OtpPurpose.SIGNUP);

    return { message: 'Account created. Please verify your mobile number with the OTP sent.' };
  }

  async verifySignupOtp(dto: VerifySignupOtpDto) {
    const agent = await this.agentRepository.findOne({ where: { mobile: dto.mobile } });
    if (!agent) {
      throw new NotFoundException('No account found for this mobile number.');
    }

    await this.otpService.verifyOtp(dto.mobile, dto.otp, OtpPurpose.SIGNUP);

    agent.isMobileVerified = true;
    agent.onboardingStep = OnboardingStep.PROFILE;
    await this.agentRepository.save(agent);

    // Create blank profile row
    const existingProfile = await this.profileRepository.findOne({ where: { agentId: agent.id } });
    if (!existingProfile) {
      const profile = this.profileRepository.create({ agentId: agent.id });
      await this.profileRepository.save(profile);
    }

    const tokens = await this.generateTokenPair(agent);
    return {
      ...tokens,
      agent: this.sanitizeAgent(agent),
      onboardingStep: agent.onboardingStep,
    };
  }

  // ─── SIGNIN ────────────────────────────────────────────────────────────────

  async sendSigninOtp(dto: SendOtpDto): Promise<{ message: string }> {
    const agent = await this.agentRepository.findOne({ where: { mobile: dto.mobile } });
    if (!agent) {
      throw new NotFoundException('No account found for this mobile number.');
    }
    if (!agent.isActive) {
      throw new UnauthorizedException('Your account has been deactivated.');
    }

    await this.otpService.sendOtp(dto.mobile, OtpPurpose.SIGNIN);
    return { message: 'OTP sent to your mobile number.' };
  }

  async signinOtp(dto: SigninOtpDto) {
    const agent = await this.agentRepository.findOne({ where: { mobile: dto.mobile } });
    if (!agent) {
      throw new NotFoundException('No account found for this mobile number.');
    }
    if (!agent.isActive) {
      throw new UnauthorizedException('Your account has been deactivated.');
    }

    await this.otpService.verifyOtp(dto.mobile, dto.otp, OtpPurpose.SIGNIN);

    const tokens = await this.generateTokenPair(agent);
    return {
      ...tokens,
      agent: this.sanitizeAgent(agent),
      onboardingStep: agent.onboardingStep,
    };
  }

  async signinPassword(dto: SigninPasswordDto) {
    const agent = await this.agentRepository.findOne({ where: { mobile: dto.mobile } });
    if (!agent || !agent.passwordHash) {
      throw new UnauthorizedException('Invalid mobile number or password.');
    }
    if (!agent.isActive) {
      throw new UnauthorizedException('Your account has been deactivated.');
    }

    const passwordValid = await bcrypt.compare(dto.password, agent.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid mobile number or password.');
    }

    const tokens = await this.generateTokenPair(agent);
    return {
      ...tokens,
      agent: this.sanitizeAgent(agent),
      onboardingStep: agent.onboardingStep,
    };
  }

  // ─── REFRESH ───────────────────────────────────────────────────────────────

  async refreshTokens(rawRefreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(rawRefreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.refreshTokenRepository.findOne({
      where: { tokenHash, agentId: payload.sub, isRevoked: false },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or has been revoked.');
    }

    const agent = await this.agentRepository.findOne({ where: { id: payload.sub } });
    if (!agent || !agent.isActive) {
      throw new UnauthorizedException('Account not found or inactive.');
    }

    // Rotate — revoke old, issue new
    await this.refreshTokenRepository.update(stored.id, { isRevoked: true });
    const tokens = await this.generateTokenPair(agent);
    return tokens;
  }

  // ─── LOGOUT ────────────────────────────────────────────────────────────────

  async logout(agentId: string, rawRefreshToken: string): Promise<{ message: string }> {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.refreshTokenRepository.update(
      { agentId, tokenHash, isRevoked: false },
      { isRevoked: true },
    );
    return { message: 'Logged out successfully.' };
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────────

  private async generateTokenPair(agent: Agent) {
    const payload = { sub: agent.id, mobile: agent.mobile, role: agent.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
    });

    // Revoke all previous active tokens for this agent (single-session enforcement)
    await this.refreshTokenRepository.update(
      { agentId: agent.id, isRevoked: false },
      { isRevoked: true },
    );

    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({ agentId: agent.id, tokenHash, expiresAt }),
    );

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private sanitizeAgent(agent: Agent) {
    const { passwordHash, ...safe } = agent as any;
    return safe;
  }
}
