import { FinancialAuditService, FinancialAuditEntry } from './financial-audit.service';

describe('FinancialAuditService', () => {
  let service: FinancialAuditService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      financialAuditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };
    service = new FinancialAuditService(mockPrisma);
  });

  const sampleEntry: FinancialAuditEntry = {
    actorId: 'admin-1',
    actorType: 'ADMIN',
    action: 'APPROVE_PAYOUT',
    entityType: 'Payout',
    entityId: 'payout-1',
    before: { status: 'PENDING_APPROVAL' },
    after: { status: 'PROCESSING' },
    metadata: { reason: 'Manual approval' },
  };

  it('should call prisma.financialAuditLog.create with correct data', async () => {
    await service.log(sampleEntry);

    expect(mockPrisma.financialAuditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: 'admin-1',
        actorType: 'ADMIN',
        action: 'APPROVE_PAYOUT',
        entityType: 'Payout',
        entityId: 'payout-1',
        before: { status: 'PENDING_APPROVAL' },
        after: { status: 'PROCESSING' },
        metadata: { reason: 'Manual approval' },
      },
    });
  });

  it('should not throw when log succeeds', async () => {
    await expect(service.log(sampleEntry)).resolves.toBeUndefined();
  });

  it('should propagate errors from prisma', async () => {
    mockPrisma.financialAuditLog.create.mockRejectedValue(new Error('DB connection failed'));

    await expect(service.log(sampleEntry)).rejects.toThrow('DB connection failed');
  });

  it('should handle entry without optional fields', async () => {
    const minimalEntry: FinancialAuditEntry = {
      actorId: 'system',
      actorType: 'SYSTEM',
      action: 'AUTO_PAYOUT',
      entityType: 'Payout',
      entityId: 'payout-2',
    };

    await service.log(minimalEntry);

    expect(mockPrisma.financialAuditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: 'system',
        actorType: 'SYSTEM',
        action: 'AUTO_PAYOUT',
      }),
    });
  });
});
