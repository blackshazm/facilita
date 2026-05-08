import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { EventEmitter2 } from '@nestjs/event-emitter';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const eventEmitter = app.get(EventEmitter2);

  const orderId = 'test-order-1778199530929';
  const customerId = 'd313480a-3384-48f7-a88d-eac891fa8d52';

  console.log('Emitting payment.captured event...');
  eventEmitter.emit('payment.captured', { orderId, customerId });
  
  // Wait a bit for the listener to process
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('Event emitted.');
  await app.close();
}

main().catch(console.error);
