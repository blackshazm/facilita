import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ENotasGatewayAdapter } from '../infrastructure/enotas-gateway.adapter';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';

@Injectable()
export class FiscalInvoiceEventListener {
  private readonly logger = new Logger(FiscalInvoiceEventListener.name);

  constructor(
    private readonly enotas: ENotasGatewayAdapter,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('payment.captured')
  async handlePaymentCaptured(event: any) {
    this.logger.log(`Handling payment.captured event for order: ${event.orderId}`);

    try {
      // 1. Get additional data (Customer/Service info)
      const order = await this.prisma.order.findUnique({
        where: { id: event.orderId },
        include: { 
          // Assuming user is the customer
          // Note: In a real app, we'd have a more robust customer model
        },
      });

      if (!order) {
        this.logger.error(`Order not found for invoice emission: ${event.orderId}`);
        return;
      }

      // 2. Issue invoice via eNotas
      const invoiceResponse = await this.enotas.issueInvoice({
        externalId: event.paymentId,
        customerName: 'Cliente Facilita', // Mocked or fetched from user
        customerEmail: 'cliente@email.com',
        customerCpfCnpj: '00000000000',
        serviceDescription: `Serviço Facilita - Pedido #${event.orderId}`,
        totalAmount: event.amount,
        commissionAmount: event.marketplaceFee,
      });

      // 3. Save Invoice record in DB
      await this.prisma.invoice.create({
        data: {
          orderId: event.orderId,
          externalId: invoiceResponse.externalId,
          status: 'ISSUED',
          totalAmount: event.amount,
          taxAmount: event.marketplaceFee * 0.265, // Estimated tax for total transparency
          ibsAmount: event.ibsAmount,
          cbsAmount: event.cbsAmount,
        },
      });

      // 4. Link Invoice to Payment
      await this.prisma.payment.update({
        where: { id: event.paymentId },
        data: { invoiceId: invoiceResponse.externalId },
      });

      this.logger.log(`Invoice successfully issued and recorded: ${invoiceResponse.externalId}`);
    } catch (error) {
      this.logger.error(`Failed to issue invoice for order ${event.orderId}: ${error.message}`);
    }
  }
}
