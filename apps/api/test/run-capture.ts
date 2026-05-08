import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CapturePaymentUseCase } from '../src/modules/payments/application/capture-payment.usecase';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const capturePayment = app.get(CapturePaymentUseCase);

  const orderId = 'test-order-promo-1778199826325';
  const providerId = '0072e115-2aca-4835-a113-3a57564c5625';

  console.log('Executing CapturePaymentUseCase...');
  await capturePayment.execute(orderId, providerId);
  
  console.log('Capture executed.');
  await app.close();
}

main().catch(console.error);
