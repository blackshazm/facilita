import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../application/auth.service';
import { GetUserUseCase } from '../application/get-user.usecase';
import { RolesGuard } from './guards/roles.guard';
import { Reflector } from '@nestjs/core';

describe('Identity AuthController', () => {
  let controller: AuthController;
  let authService: any;
  let getUserUseCase: any;

  beforeEach(async () => {
    authService = {
      requestOtp: jest.fn().mockResolvedValue(undefined),
      verifyOtp: jest.fn(),
    };
    getUserUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: GetUserUseCase, useValue: getUserUseCase },
        RolesGuard,
        Reflector,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('requestOtp', () => {
    it('should call authService.requestOtp and return success message', async () => {
      const result = await controller.requestOtp({ phone: '+5511999999999' });

      expect(authService.requestOtp).toHaveBeenCalledWith('+5511999999999');
      expect(result).toEqual({ message: 'OTP sent via WhatsApp' });
    });
  });

  describe('verifyOtp', () => {
    it('should call authService.verifyOtp and return its result', async () => {
      const expectedResult = { token: 'jwt-token', user: { id: 'user-1' } };
      authService.verifyOtp.mockResolvedValue(expectedResult);

      const result = await controller.verifyOtp({ 
        phone: '+5511999999999', 
        code: '123456', 
        inviteCode: 'INVITE123' 
      });

      expect(authService.verifyOtp).toHaveBeenCalledWith('+5511999999999', '123456', 'INVITE123', undefined);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getMe', () => {
    it('should call getUserUseCase with userId from token', async () => {
      const mockUser = { id: 'user-1', name: 'Test User' };
      getUserUseCase.execute.mockResolvedValue(mockUser);

      const req = { user: { userId: 'user-1' } };
      const result = await controller.getMe(req);

      expect(getUserUseCase.execute).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('adminPing', () => {
    it('should return admin access confirmed', async () => {
      const result = await controller.adminPing();
      expect(result).toEqual({ message: 'Admin access confirmed' });
    });
  });
});
