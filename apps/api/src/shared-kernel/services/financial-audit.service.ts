import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface FinancialAuditEntry {
  actorId: string;
  actorType: 'SYSTEM' | 'ADMIN' | 'OPERATOR';
  action: string;
  entityType: string;
  entityId: string;
  before?: any;
  after?: any;
  metadata?: any;
}

@Injectable()
export class FinancialAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(entry: FinancialAuditEntry): Promise<void> {
    try {
      console.log('AUDIT LOG DATA:', JSON.stringify(entry, null, 2));
      await this.prisma.financialAuditLog.create({
        data: {
          actorId: entry.actorId,
          actorType: entry.actorType,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          before: entry.before,
          after: entry.after,
          metadata: entry.metadata,
        },
      });
    } catch (err: any) {
      console.error('AUDIT LOG ERROR:', err.message);
      throw err;
    }
  }
}
