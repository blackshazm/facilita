import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.financialAuditLog.findMany({
    where: { action: 'PROMO_DISCOUNT_APPLIED' }
  });
  
  console.log('Promo logs:', JSON.stringify(logs, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
