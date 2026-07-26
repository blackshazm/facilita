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
});
