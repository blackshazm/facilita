import { KycService } from './apps/api/src/modules/identity/application/kyc.service';
import { Test, TestingModule } from '@nestjs/testing';
import { StoragePort } from './apps/api/src/modules/identity/ports/storage.port';
import { PrismaService } from './apps/api/src/shared-kernel/database/prisma.service';
import { BadRequestException } from '@nestjs/common';

async function testKycValidation() {
  const mockStorage = { generatePresignedUploadUrl: jest.fn() };
  const mockPrisma = {};
  
  const service = new KycService(mockStorage as any, mockPrisma as any);

  try {
    await service.getUploadUrl('user-1', 'selfie', 'application/pdf');
    console.log('FAIL: Expected error for invalid MIME type');
  } catch (e) {
    if (e instanceof BadRequestException) {
      console.log('PASS: Caught expected BadRequestException for invalid MIME');
    } else {
      console.log('FAIL: Unexpected error type:', e);
    }
  }

  try {
    await service.getUploadUrl('user-1', 'selfie', 'image/jpeg');
    console.log('PASS: Successfully generated URL for image/jpeg');
  } catch (e) {
    console.log('FAIL: Error for valid MIME type:', e);
  }
}

testKycValidation();
