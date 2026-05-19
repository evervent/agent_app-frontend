import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { Agent } from '../agents/entities/agent.entity';
import { AgentProfile } from '../agents/entities/agent-profile.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Agent, AgentProfile, RefreshToken]),
    OtpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, AuthService],
})
export class AuthModule {}
