import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orderId = 'test-order-promo-1778199826325';
  const payment = await prisma.payment.findFirst({
    where: { orderId }
  });
  
  console.log('Payment:', JSON.stringify(payment, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
