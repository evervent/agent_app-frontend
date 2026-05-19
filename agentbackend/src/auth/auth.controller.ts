import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { SignupDto } from './dto/signup.dto';
import { VerifySignupOtpDto } from './dto/verify-signup-otp.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { SigninOtpDto } from './dto/signin-otp.dto';
import { SigninPasswordDto } from './dto/signin-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── SIGNUP ────────────────────────────────────────────────────────────────

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('verify-signup-otp')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  verifySignupOtp(@Body() dto: VerifySignupOtpDto) {
    return this.authService.verifySignupOtp(dto);
  }

  // ─── SIGNIN ────────────────────────────────────────────────────────────────

  @Post('send-otp')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendSigninOtp(dto);
  }

  @Post('signin/otp')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  signinOtp(@Body() dto: SigninOtpDto) {
    return this.authService.signinOtp(dto);
  }

  @Post('signin/password')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  signinPassword(@Body() dto: SigninPasswordDto) {
    return this.authService.signinPassword(dto);
  }

  // ─── REFRESH ───────────────────────────────────────────────────────────────

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  // ─── LOGOUT ────────────────────────────────────────────────────────────────

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@Request() req: any, @Body() dto: RefreshTokenDto) {
    return this.authService.logout(req.user.sub, dto.refreshToken);
  }
}
