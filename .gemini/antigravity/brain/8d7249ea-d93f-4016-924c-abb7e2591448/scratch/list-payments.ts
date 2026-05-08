import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const payments = await prisma.payment.findMany();
  console.log('Total payments:', payments.length);
  payments.forEach(p => console.log(p.orderId, p.status));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
