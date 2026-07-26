import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { SendOtpUseCase } from './send-otp.use-case';
import { VerifyOtpUseCase } from './verify-otp.use-case';

describe('AuthController', () => {
  let controller: AuthController;
  let sendOtpUseCase: any;
  let verifyOtpUseCase: any;

  beforeEach(async () => {
    sendOtpUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    verifyOtpUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: SendOtpUseCase, useValue: sendOtpUseCase },
        { provide: VerifyOtpUseCase, useValue: verifyOtpUseCase },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('sendOtp', () => {
    it('should call sendOtpUseCase and return success message', async () => {
      const result = await controller.sendOtp({ phone: '+5511999999999' });

      expect(sendOtpUseCase.execute).toHaveBeenCalledWith({ phone: '+5511999999999' });
      expect(result).toEqual({ success: true, message: 'OTP sent' });
    });
  });

  describe('verifyOtp', () => {
    it('should return tokens on successful verification', async () => {
      verifyOtpUseCase.execute.mockResolvedValue({ token: 'real-jwt-token' });

      const result = await controller.verifyOtp({ phone: '+5511999999999', otpCode: '123456' });

      expect(verifyOtpUseCase.execute).toHaveBeenCalledWith({ phone: '+5511999999999', otpCode: '123456' });
      expect(result).toEqual({
        success: true,
        accessToken: 'real-jwt-token',
        refreshToken: 'mock-refresh-token',
      });
    });

    it('should use fallback mock-access-token if token is empty', async () => {
      verifyOtpUseCase.execute.mockResolvedValue({ token: '' });

      const result = await controller.verifyOtp({ phone: '+5511999999999', otpCode: '123456' });

      expect(result.accessToken).toBe('mock-access-token');
    });
  });
});
