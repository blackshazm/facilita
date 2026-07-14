// PRD: 2.4 Usuários e Personas
import { Module } from '@nestjs/common';
import { SendOtpUseCase } from './application/send-otp.use-case';
import { VerifyOtpUseCase } from './application/verify-otp.use-case';
import { AuthController } from './application/auth.controller';
import { AUTH_REPOSITORY } from './ports/auth.repository.port';
import { SMS_SERVICE, TOKEN_SERVICE } from './ports/auth.service.port';
import { USER_REPOSITORY } from '../users/ports/user.repository.port';

// Mocks
const mockAuthRepo = {
  saveOtpSession: async () => {},
  getOtpSession: async () => null,
  deleteOtpSession: async () => {},
};

const mockSmsService = {
  sendSms: async () => {},
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
    { provide: AUTH_REPOSITORY, useValue: mockAuthRepo },
    { provide: SMS_SERVICE, useValue: mockSmsService },
    { provide: TOKEN_SERVICE, useValue: mockTokenService },
    { provide: USER_REPOSITORY, useValue: mockUserRepo },
  ],
})
export class AuthModule {}
