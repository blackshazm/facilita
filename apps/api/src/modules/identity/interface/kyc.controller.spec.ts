import { Test, TestingModule } from '@nestjs/testing';
import { KycController } from './kyc.controller';
import { KycService } from '../application/kyc.service';
import { RunProviderVerificationUseCase } from '../../fraud/application/run-provider-verification.usecase';

describe('KycController', () => {
  let controller: KycController;
  let kycService: any;
  let runProviderVerification: any;

  beforeEach(async () => {
    kycService = {
      getUploadUrl: jest.fn(),
      submit: jest.fn(),
      listPendingSubmissions: jest.fn(),
      approveSubmission: jest.fn(),
      rejectSubmission: jest.fn(),
    };

    runProviderVerification = {
      execute: jest.fn().mockResolvedValue({ status: 'APPROVED' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [KycController],
      providers: [
        { provide: KycService, useValue: kycService },
        { provide: RunProviderVerificationUseCase, useValue: runProviderVerification },
      ],
    }).compile();

    controller = module.get<KycController>(KycController);
  });

  describe('getUploadUrl', () => {
    it('should delegate to KycService and return the URL', async () => {
      const expectedResult = { uploadUrl: 'https://s3.aws.com/...', key: 'kyc/.../selfie.jpg' };
      kycService.getUploadUrl.mockResolvedValue(expectedResult);

      const req = { user: { id: 'user-1' } };
      const body = { type: 'selfie' as const, mimeType: 'image/jpeg' };

      const result = await controller.getUploadUrl(req, body);

      expect(kycService.getUploadUrl).toHaveBeenCalledWith('user-1', 'selfie', 'image/jpeg');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('submit', () => {
    it('should delegate to KycService and return the result', async () => {
      kycService.submit.mockResolvedValue({ message: 'KYC submitted successfully' });

      const req = { user: { id: 'user-1' } };
      const body = {
        selfieKey: 'selfie.jpg',
        documentFrontKey: 'doc_front.jpg',
        documentBackKey: 'doc_back.jpg',
      };

      const result = await controller.submit(req, body);

      expect(kycService.submit).toHaveBeenCalledWith('user-1', body);
      expect(result).toEqual({ message: 'KYC submitted successfully' });
    });
  });

  describe('admin moderation', () => {
    it('should list pending submissions', async () => {
      const mockList = [{ id: 'sub-1', name: 'Prestador 1', status: 'PENDING' }];
      kycService.listPendingSubmissions.mockResolvedValue(mockList);

      const result = await controller.listPending();

      expect(kycService.listPendingSubmissions).toHaveBeenCalled();
      expect(result).toEqual(mockList);
    });

    it('should approve a KYC submission', async () => {
      kycService.approveSubmission.mockResolvedValue({ id: 'sub-1', status: 'APPROVED' });
      const req = { user: { id: 'admin-99' } };

      const result = await controller.approve('sub-1', req);

      expect(kycService.approveSubmission).toHaveBeenCalledWith('sub-1', 'admin-99');
      expect(result).toEqual({ id: 'sub-1', status: 'APPROVED' });
    });

    it('should reject a KYC submission with reason', async () => {
      kycService.rejectSubmission.mockResolvedValue({ id: 'sub-1', status: 'REJECTED' });
      const req = { user: { id: 'admin-99' } };
      const body = { reason: 'Documento ilegível' };

      const result = await controller.reject('sub-1', body, req);

      expect(kycService.rejectSubmission).toHaveBeenCalledWith('sub-1', 'Documento ilegível', 'admin-99');
      expect(result).toEqual({ id: 'sub-1', status: 'REJECTED' });
    });
  });
});
