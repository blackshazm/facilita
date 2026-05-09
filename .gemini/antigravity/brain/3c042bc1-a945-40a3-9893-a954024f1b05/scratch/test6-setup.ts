import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test6() {
  // 1. Get a valid provider
  const provider = await prisma.providerProfile.findFirst({
    where: { pagarmeRecipientId: { startsWith: 're_clv' } }
  });

  if (!provider) {
    console.error('Provider not found');
    return;
  }

  // 2. Create an expensive payout (R$ 20.000,00 > R$ 10.000,00 mock)
  const payout = await prisma.payout.create({
    data: {
      providerId: provider.id,
      amount: 2000000n,
      fee: 500n,
      status: 'PENDING_APPROVAL'
    }
  });

  console.log('Created expensive payout:', payout.id);
}

test6().catch(console.error).finally(() => prisma.$disconnect());
