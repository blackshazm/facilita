import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SendOtpUseCase } from './send-otp.use-case';
import { AUTH_REPOSITORY } from '../ports/auth.repository.port';
import { OTP_RATE_LIMITER, SMS_SERVICE } from '../ports/auth.service.port';

describe('SendOtpUseCase', () => {
  let useCase: SendOtpUseCase;
  let authRepo: any;
  let smsService: any;
  let rateLimiter: any;

  beforeEach(async () => {
    authRepo = {
      saveOtpSession: jest.fn().mockResolvedValue(undefined),
      getOtpSession: jest.fn(),
      deleteOtpSession: jest.fn(),
    };
    smsService = {
      sendSms: jest.fn().mockResolvedValue(undefined),
    };
    rateLimiter = {
      checkAndIncrement: jest.fn().mockResolvedValue({
        allowed: true,
        remainingAttempts: 2,
        retryAfterSeconds: 600,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendOtpUseCase,
        { provide: AUTH_REPOSITORY, useValue: authRepo },
        { provide: SMS_SERVICE, useValue: smsService },
        { provide: OTP_RATE_LIMITER, useValue: rateLimiter },
      ],
    }).compile();

    useCase = module.get<SendOtpUseCase>(SendOtpUseCase);
  });

  it('should save an OTP session to the repository with normalized phone', async () => {
    await useCase.execute({ phone: '11999999999' });
    expect(authRepo.saveOtpSession).toHaveBeenCalledTimes(1);
    const savedSession = authRepo.saveOtpSession.mock.calls[0][0];
    expect(savedSession.phone).toBe('+5511999999999');
    expect(savedSession.otpCode).toMatch(/^\d{6}$/);
  });

  it('should send an SMS with the OTP code to normalized phone', async () => {
    await useCase.execute({ phone: '(11) 99999-9999' });
    expect(smsService.sendSms).toHaveBeenCalledTimes(1);
    expect(smsService.sendSms).toHaveBeenCalledWith(
      '+5511999999999',
      expect.stringContaining('FACILITA'),
    );
  });

  it('should generate a 6-digit OTP code', async () => {
    await useCase.execute({ phone: '+5511888888888' });
    const savedSession = authRepo.saveOtpSession.mock.calls[0][0];
    const code = savedSession.otpCode;
    expect(code.length).toBe(6);
    expect(Number(code)).toBeGreaterThanOrEqual(100000);
    expect(Number(code)).toBeLessThan(1000000);
  });

  it('should set expiration to 5 minutes in the future', async () => {
    const before = Date.now();
    await useCase.execute({ phone: '+5511999999999' });
    const savedSession = authRepo.saveOtpSession.mock.calls[0][0];
    const expiresAt = savedSession.expiresAt.getTime();
    expect(expiresAt).toBeGreaterThanOrEqual(before + 4 * 60 * 1000);
    expect(expiresAt).toBeLessThanOrEqual(before + 6 * 60 * 1000);
  });

  it('should throw HTTP 429 Too Many Requests if rate limiter blocks attempt', async () => {
    rateLimiter.checkAndIncrement.mockResolvedValueOnce({
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds: 300,
    });

    await expect(useCase.execute({ phone: '+5511999999999' })).rejects.toThrow(HttpException);
    expect(authRepo.saveOtpSession).not.toHaveBeenCalled();
    expect(smsService.sendSms).not.toHaveBeenCalled();
  });

  it('should throw BAD_REQUEST if phone number is empty or invalid', async () => {
    await expect(useCase.execute({ phone: '' })).rejects.toThrow(
      new HttpException('Número de telefone inválido.', HttpStatus.BAD_REQUEST),
    );
  });
});
