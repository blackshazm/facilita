import { Test, TestingModule } from '@nestjs/testing';
import { VerifyOtpUseCase } from './verify-otp.use-case';
import { AUTH_REPOSITORY } from '../ports/auth.repository.port';
import { TOKEN_SERVICE } from '../ports/auth.service.port';
import { USER_REPOSITORY } from '../../users/ports/user.repository.port';
import { OtpSession } from '../core/auth.entity';

describe('VerifyOtpUseCase', () => {
  let useCase: VerifyOtpUseCase;
  let authRepo: any;
  let tokenService: any;
  let userRepo: any;

  beforeEach(async () => {
    authRepo = {
      saveOtpSession: jest.fn(),
      getOtpSession: jest.fn(),
      deleteOtpSession: jest.fn().mockResolvedValue(undefined),
    };
    tokenService = {
      generateToken: jest.fn().mockResolvedValue('jwt-token-123'),
      verifyToken: jest.fn(),
    };
    userRepo = {
      findById: jest.fn(),
      findByPhone: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyOtpUseCase,
        { provide: AUTH_REPOSITORY, useValue: authRepo },
        { provide: TOKEN_SERVICE, useValue: tokenService },
        { provide: USER_REPOSITORY, useValue: userRepo },
      ],
    }).compile();

    useCase = module.get<VerifyOtpUseCase>(VerifyOtpUseCase);
  });

  it('should return token for valid OTP and existing user', async () => {
    const session = new OtpSession('+5511999999999', '123456', new Date(Date.now() + 300000));
    authRepo.getOtpSession.mockResolvedValue(session);
    userRepo.findByPhone.mockResolvedValue({ id: 'user-1', role: 'CUSTOMER' });

    const result = await useCase.execute({ phone: '+5511999999999', otpCode: '123456' });

    expect(result.token).toBe('jwt-token-123');
    expect(result.isNewUser).toBe(false);
    expect(authRepo.deleteOtpSession).toHaveBeenCalledWith('+5511999999999');
  });

  it('should throw when OTP session is not found', async () => {
    authRepo.getOtpSession.mockResolvedValue(null);

    await expect(
      useCase.execute({ phone: '+5511999999999', otpCode: '123456' }),
    ).rejects.toThrow('OTP session not found or expired');
  });

  it('should throw when OTP code is wrong', async () => {
    const session = new OtpSession('+5511999999999', '123456', new Date(Date.now() + 300000));
    authRepo.getOtpSession.mockResolvedValue(session);

    await expect(
      useCase.execute({ phone: '+5511999999999', otpCode: '000000' }),
    ).rejects.toThrow('Invalid OTP code');
  });

  it('should throw when OTP is expired', async () => {
    const session = new OtpSession('+5511999999999', '123456', new Date(Date.now() - 1000));
    authRepo.getOtpSession.mockResolvedValue(session);

    await expect(
      useCase.execute({ phone: '+5511999999999', otpCode: '123456' }),
    ).rejects.toThrow('OTP expired');
  });

  it('should throw when user is not found (redirect to signup)', async () => {
    const session = new OtpSession('+5511999999999', '123456', new Date(Date.now() + 300000));
    authRepo.getOtpSession.mockResolvedValue(session);
    userRepo.findByPhone.mockResolvedValue(null);

    await expect(
      useCase.execute({ phone: '+5511999999999', otpCode: '123456' }),
    ).rejects.toThrow('User not found');
  });
});
