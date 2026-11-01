// PRD: 2.4 Usuários e Personas
import { Module } from '@nestjs/common';
import { SendOtpUseCase } from './application/send-otp.use-case';
import { VerifyOtpUseCase } from './application/verify-otp.use-case';
import { AuthController } from './application/auth.controller';
import { AUTH_REPOSITORY } from './ports/auth.repository.port';
import { OTP_RATE_LIMITER, SMS_SERVICE, TOKEN_SERVICE } from './ports/auth.service.port';
import { USER_REPOSITORY } from '../users/ports/user.repository.port';
import { TwilioSmsAdapter } from './adapters/twilio-sms.adapter';
import { RedisOtpRateLimiterAdapter } from './adapters/redis-otp-rate-limiter.adapter';
import { JwtStrategy } from './strategies/jwt.strategy';

// Repositórios simulados (Mocks padrão até persistência dedicada)
const mockAuthRepo = {
  saveOtpSession: async () => {},
  getOtpSession: async () => null,
  deleteOtpSession: async () => {},
};

const mockTokenService = {
  generateToken: async () => 'mock-jwt-token',
  verifyToken: async () => ({ userId: '123', role: 'CUSTOMER' }),
};

const mockUserRepo = {
  findById: async () => null,
  findByPhone: async () => null,
  save: async () => {},
};

@Module({
  controllers: [AuthController],
  providers: [
    SendOtpUseCase,
    VerifyOtpUseCase,
    JwtStrategy,
    TwilioSmsAdapter,
    RedisOtpRateLimiterAdapter,
    { provide: AUTH_REPOSITORY, useValue: mockAuthRepo },
    { provide: SMS_SERVICE, useClass: TwilioSmsAdapter },
    { provide: OTP_RATE_LIMITER, useClass: RedisOtpRateLimiterAdapter },
    { provide: TOKEN_SERVICE, useValue: mockTokenService },
    { provide: USER_REPOSITORY, useValue: mockUserRepo },
  ],
  exports: [SendOtpUseCase, VerifyOtpUseCase, SMS_SERVICE, OTP_RATE_LIMITER],
})
export class AuthModule {}
