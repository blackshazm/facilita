import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { EventEmitter2 } from '@nestjs/event-emitter';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const eventEmitter = app.get(EventEmitter2);

  const orderId = 'test-order-1778199530929';

  console.log('Emitting order.cancelled event...');
  eventEmitter.emit('order.cancelled', { orderId });
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('Event emitted.');
  await app.close();
}

main().catch(console.error);
