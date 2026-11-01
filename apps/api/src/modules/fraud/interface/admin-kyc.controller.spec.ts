import { Test, TestingModule } from '@nestjs/testing';
import { AdminKycController } from './admin-kyc.controller';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AdminKycController', () => {
  let controller: AdminKycController;
  let prisma: any;
  let eventEmitter: any;

  beforeEach(async () => {
    prisma = {
      kycSubmission: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      providerProfile: {
        updateMany: jest.fn(),
      },
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminKycController],
      providers: [
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    controller = module.get<AdminKycController>(AdminKycController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPendingSubmissions', () => {
    it('should return pending KYC submissions', async () => {
      const mockList = [
        {
          id: 'sub-1',
          userId: 'user-1',
          status: 'PENDING',
          user: { name: 'Carlos Andrade', phone: '1199999999' },
        },
      ];
      prisma.kycSubmission.findMany.mockResolvedValue(mockList);

      const result = await controller.getPendingSubmissions();
      expect(result).toEqual(mockList);
      expect(prisma.kycSubmission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'PENDING' } }),
      );
    });
  });

  describe('approveSubmission', () => {
    it('should approve submission and emit event', async () => {
      prisma.kycSubmission.findUnique.mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        status: 'PENDING',
      });
      prisma.kycSubmission.update.mockResolvedValue({
        id: 'sub-1',
        status: 'APPROVED',
      });

      const res = await controller.approveSubmission('sub-1');
      expect(res.status).toBe('APPROVED');
      expect(eventEmitter.emit).toHaveBeenCalledWith('provider.kyc_approved', {
        submissionId: 'sub-1',
        userId: 'user-1',
      });
    });

    it('should throw NotFoundException if submission not found', async () => {
      prisma.kycSubmission.findUnique.mockResolvedValue(null);
      await expect(controller.approveSubmission('sub-invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('rejectSubmission', () => {
    it('should reject submission with reason and emit event', async () => {
      prisma.kycSubmission.findUnique.mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        status: 'PENDING',
      });
      prisma.kycSubmission.update.mockResolvedValue({
        id: 'sub-1',
        status: 'REJECTED',
      });

      const res = await controller.rejectSubmission('sub-1', {
        reason: 'Documento borrado',
      });
      expect(res.status).toBe('REJECTED');
      expect(res.reason).toBe('Documento borrado');
      expect(eventEmitter.emit).toHaveBeenCalledWith('provider.kyc_rejected', {
        submissionId: 'sub-1',
        userId: 'user-1',
        reason: 'Documento borrado',
      });
    });

    it('should throw BadRequestException if reason is missing', async () => {
      await expect(
        controller.rejectSubmission('sub-1', { reason: '' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

