import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const referrerPhone = '+5511999999999';
  
  // 1. Set limit to 1 and count to 1
  await prisma.user.update({
    where: { phone: referrerPhone },
    data: {
      referralLimit: 1,
      referralCount: 1
    }
  });

  console.log('Referrer limit reached (1/1)');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
