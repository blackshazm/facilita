import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { RunProviderVerificationUseCase } from '../application/run-provider-verification.usecase';
import { BACKGROUND_CHECK_PORT } from '../ports/background-check.port';
import { KYC_VERIFICATION_PORT } from '../ports/kyc-verification.port';
import { MEI_VALIDATION_PORT } from '../ports/mei-validation.port';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';

describe('RunProviderVerificationUseCase', () => {
  let useCase: RunProviderVerificationUseCase;
  let eventEmitter: EventEmitter2;
  let prisma: any;
  let backgroundCheck: any;
  let kycVerification: any;
  let meiValidation: any;

  const baseInput = {
    providerId: 'provider-1',
    userId: 'user-1',
    cpf: '123.456.789-00',
    cnpj: '12.345.678/0001-90',
    selfieUrl: 'https://s3.example.com/selfie.jpg',
    documentUrl: 'https://s3.example.com/doc.jpg',
    documentType: 'CNH' as const,
  };

  beforeEach(async () => {
    prisma = {
      providerProfile: {
        update: jest.fn().mockResolvedValue({}),
      },
      fraudSignal: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    backgroundCheck = {
      check: jest.fn().mockResolvedValue({
        cpf: baseInput.cpf,
        hasCriminalRecord: false,
        severity: 'NONE',
      }),
    };

    kycVerification = {
      verifySelfieDocument: jest.fn().mockResolvedValue({
        verificationId: 'kyc-123',
        status: 'APPROVED',
        matchScore: 95,
      }),
    };

    meiValidation = {
      validate: jest.fn().mockResolvedValue({
        cnpj: baseInput.cnpj,
        isActive: true,
        companyName: 'João Silva MEI',
        situation: 'ATIVA',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        RunProviderVerificationUseCase,
        { provide: PrismaService, useValue: prisma },
        { provide: BACKGROUND_CHECK_PORT, useValue: backgroundCheck },
        { provide: KYC_VERIFICATION_PORT, useValue: kycVerification },
        { provide: MEI_VALIDATION_PORT, useValue: meiValidation },
      ],
    }).compile();

    useCase = module.get<RunProviderVerificationUseCase>(RunProviderVerificationUseCase);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('Happy Path — APPROVED', () => {
    it('deve retornar APPROVED quando MEI ativo, sem ficha criminal e KYC aprovado', async () => {
      const result = await useCase.execute(baseInput);

      expect(result.status).toBe('APPROVED');
      expect(prisma.providerProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isFlagged: false, fraudReason: null } }),
      );
    });
  });

  describe('Bloqueio — MEI inativo', () => {
    it('deve retornar BLOCKED quando MEI está inativo', async () => {
      meiValidation.validate.mockResolvedValueOnce({
        cnpj: baseInput.cnpj,
        isActive: false,
        situation: 'BAIXADA',
      });

      const result = await useCase.execute(baseInput);

      expect(result.status).toBe('BLOCKED');
      expect(result.blockReason).toBe('MEI_INACTIVE');
      expect(prisma.providerProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isFlagged: true, fraudReason: 'MEI_INACTIVE' },
        }),
      );
      // Background check não deve ser chamado se MEI já falhou
      expect(backgroundCheck.check).not.toHaveBeenCalled();
    });
  });

  describe('Bloqueio — Antecedentes criminais graves', () => {
    it('deve retornar BLOCKED quando Background Check retorna severity MAJOR', async () => {
      backgroundCheck.check.mockResolvedValueOnce({
        cpf: baseInput.cpf,
        hasCriminalRecord: true,
        severity: 'MAJOR',
        crimes: ['estelionato', 'fraude'],
      });

      const result = await useCase.execute(baseInput);

      expect(result.status).toBe('BLOCKED');
      expect(result.blockReason).toBe('CRIMINAL_RECORD_MAJOR');
      expect(prisma.providerProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isFlagged: true, fraudReason: 'CRIMINAL_RECORD_MAJOR' },
        }),
      );
    });
  });

  describe('Revisão Manual — KYC com score baixo', () => {
    it('deve retornar MANUAL_REVIEW quando KYC rejeitado (score < 85)', async () => {
      kycVerification.verifySelfieDocument.mockResolvedValueOnce({
        verificationId: 'kyc-456',
        status: 'REJECTED',
        matchScore: 60,
        rejectionReason: 'FACE_MISMATCH',
      });

      const result = await useCase.execute(baseInput);

      expect(result.status).toBe('MANUAL_REVIEW');
      expect(result.blockReason).toBe('KYC_FACE_MISMATCH');
      expect(prisma.fraudSignal.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Revisão Manual — Antecedentes leves', () => {
    it('deve retornar MANUAL_REVIEW quando Background Check retorna severity MINOR', async () => {
      backgroundCheck.check.mockResolvedValueOnce({
        cpf: baseInput.cpf,
        hasCriminalRecord: true,
        severity: 'MINOR',
        crimes: ['contravenção de trânsito'],
      });

      const result = await useCase.execute(baseInput);

      expect(result.status).toBe('MANUAL_REVIEW');
      expect(prisma.fraudSignal.create).toHaveBeenCalledTimes(1);
    });
  });
});
