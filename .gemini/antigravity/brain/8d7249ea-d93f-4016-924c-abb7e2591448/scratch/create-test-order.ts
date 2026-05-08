import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { phone: '+5511777777777' }
  });

  if (!user) {
    console.error('User not found');
    return;
  }

  const orderId = 'test-order-' + Date.now();

  // 1. Create a "DONE" order
  await prisma.order.create({
    data: {
      id: orderId,
      userId: user.id,
      status: 'DONE',
      totalAmount: 50.00,
    }
  });

  console.log('Order created in DONE status');
  console.log('OrderId:', orderId);
  console.log('CustomerId:', user.id);
}

main()
  .catch((e: any) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
