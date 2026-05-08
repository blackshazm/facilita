import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const providerId = '0072e115-2aca-4835-a113-3a57564c5625';
  const customerId = 'd313480a-3384-48f7-a88d-eac891fa8d52';
  
  const orderId = 'test-order-promo-' + Date.now();

  // 1. Create Order
  await prisma.order.create({
    data: {
      id: orderId,
      userId: customerId,
      providerId: providerId,
      status: 'MATCHED',
      totalAmount: 100.00,
    }
  });

  // 2. Create Authorized Payment
  await prisma.payment.create({
    data: {
      orderId: orderId,
      amount: 100.00,
      status: 'AUTHORIZED',
      method: 'CARD',
      externalId: 'ext_auth_' + Date.now(),
    }
  });

  console.log('Order and Payment (AUTHORIZED) created.');
  console.log('OrderId:', orderId);
  console.log('ProviderId:', providerId);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
