import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const phone = '5511888888888' + Math.floor(Math.random() * 1000);
  const cpfCnpj = '123456789' + Math.floor(Math.random() * 90 + 10);
  const recipientId = 're_clv' + Math.floor(Math.random() * 1000000000);

  // 1. Create Admin User
  await prisma.user.upsert({
    where: { phone: '5511999999999' },
    update: { role: 'ADMIN' },
    create: { phone: '5511999999999', role: 'ADMIN', name: 'Admin Test' }
  });

  // 2. Create Provider
  const providerUser = await prisma.user.create({
    data: {
      phone,
      role: 'PROVIDER',
      name: 'Provider Test ' + phone,
      profile: {
        create: {
          cpfCnpj,
          startHour: '08:00',
          endHour: '18:00',
          pagarmeRecipientId: recipientId,
          bankAccount: '1234567',
          bankAccountDigit: '8',
          bankCode: '341',
          bankBranch: '0001',
          bankDataUpdatedAt: new Date()
        }
      }
    },
    include: { profile: true }
  });

  const profileId = providerUser.profile!.id;

  // 3. Wallet
  await prisma.wallet.create({
    data: { providerId: providerUser.id, balance: 500000n, pendingBalance: 0n, promoBalance: 0n }
  });

  // 4. Payouts
  await prisma.payout.createMany({
    data: Array.from({ length: 15 }).map(() => ({
      providerId: profileId, // Use PROFILE ID
      amount: 100000n,
      fee: 500n,
      status: 'PENDING_APPROVAL'
    }))
  });
  console.log('Seed done for provider:', phone, 'Profile ID:', profileId);
}

main().catch(console.error).finally(() => prisma.$disconnect());
