import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { PayoutRepositoryPort, PayoutStatus } from '../ports/payout-repository.port';

@Injectable()
export class ProcessPayoutWebhookUseCase {
  constructor(
    @Inject('PayoutRepositoryPort')
    private readonly payoutRepository: PayoutRepositoryPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private verifySignature(rawBody: Buffer, signature: string, secret: string): boolean {
    if (!signature) return false;
    if (!rawBody) return false;

    try {
      const computedHash = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(computedHash, 'hex'),
      );
    } catch {
      return false;
    }
  }

  async execute(rawBody: Buffer, signature: string, payload: any): Promise<{ received: boolean }> {
    // 1. D-02 Signature Check & Test Mock Bypass
    const secretKey = process.env.PAGARME_SECRET_KEY;
    const webhookSecret = process.env.PAGARME_WEBHOOK_SECRET || '';

    if (secretKey !== 'sk_test_mock') {
      if (!this.verifySignature(rawBody, signature, webhookSecret)) {
        throw new UnauthorizedException('Invalid webhook signature');
      }
    }

    // 2. Identify target event type
    const eventType = payload.type;
    if (!eventType || !eventType.startsWith('transfer.')) {
      return { received: false };
    }

    const externalId = payload.data?.id;
    if (!externalId) {
      return { received: false };
    }

    // 3. Find target Payout
    const payout = await this.payoutRepository.findByExternalId(externalId);
    if (!payout) {
      console.warn(`[ProcessPayoutWebhookUseCase] Payout with externalId ${externalId} not found.`);
      return { received: false };
    }

    // 4. D-04 Idempotency Check
    if (payout.status === PayoutStatus.PAID || payout.status === PayoutStatus.FAILED) {
      return { received: true };
    }

    // 5. Map events to PayoutStatus
    let newStatus: PayoutStatus | null = null;
    switch (eventType) {
      case 'transfer.processing':
        newStatus = PayoutStatus.PROCESSING;
        break;
      case 'transfer.transferred':
      case 'transfer.success':
        newStatus = PayoutStatus.PAID;
        break;
      case 'transfer.failed':
      case 'transfer.canceled':
        newStatus = PayoutStatus.FAILED;
        break;
      default:
        // Outros eventos de transferência que não alteram o status terminal podem ser recebidos de forma segura
        return { received: true };
    }

    if (!newStatus) {
      return { received: true };
    }

    // 6. Atualizar status e salvar
    payout.status = newStatus;
    payout.updatedAt = new Date();
    await this.payoutRepository.save(payout);

    // 7. Se falhou, emitir evento de domínio para reverter o saldo
    if (newStatus === PayoutStatus.FAILED) {
      this.eventEmitter.emit('payout.failed', {
        payoutId: payout.id,
        providerId: payout.providerId,
        amount: payout.amount.toString(),
      });
    }

    return { received: true };
  }
}
