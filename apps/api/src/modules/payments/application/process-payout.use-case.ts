// PRD: 4.4 Pagamento e Finalização
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaymentEntity } from '../core/payment.entity';
import { PAYMENT_GATEWAY, PaymentGatewayPort, PAYMENTS_REPOSITORY, PaymentsRepositoryPort } from '../ports/payments.port';

interface ProcessPayoutDto {
  jobId: string;
  providerId: string;
  payoutCents: number;
}

@Injectable()
export class ProcessPayoutUseCase {
  private readonly logger = new Logger(ProcessPayoutUseCase.name);

  constructor(
    @Inject(PAYMENTS_REPOSITORY)
    private readonly paymentsRepository: PaymentsRepositoryPort,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(dto: ProcessPayoutDto): Promise<PaymentEntity> {
    this.logger.log(`Processing payout for Job: ${dto.jobId}, Provider: ${dto.providerId}, Amount: ${dto.payoutCents} cents`);
    
    // Create new payment intent record
    const payment = new PaymentEntity(
      `pay_${Math.random().toString(36).substring(7)}`,
      dto.jobId,
      dto.providerId,
      dto.payoutCents,
    );

    try {
      // Execute the actual transfer to the provider via Stripe/Gateway
      const txRef = await this.paymentGateway.transferToProvider(dto.providerId, dto.payoutCents);
      this.logger.log(`Transfer successful. TX Ref: ${txRef}`);
      payment.markAsProcessed();
    } catch (error) {
      this.logger.error(`Transfer failed: ${(error as Error).message}`);
      payment.markAsFailed();
      // Handle retry logic or alerts here in the future
    }

    await this.paymentsRepository.save(payment);
    return payment;
  }
}
