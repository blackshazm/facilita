import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  // 1. Get existing admin or create
  const adminPhone = '+5511999999999';
  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: { role: 'ADMIN' },
    create: {
      id: crypto.randomUUID(),
      phone: adminPhone,
      role: 'ADMIN',
      isVerified: true,
    }
  });

  // 2. Find any provider profile or create one
  let providerProfile = await prisma.providerProfile.findFirst();
  
  if (!providerProfile) {
    const providerPhone = '+5511888888888';
    const providerUser = await prisma.user.upsert({
      where: { phone: providerPhone },
      update: { role: 'PROVIDER' },
      create: {
        id: crypto.randomUUID(),
        phone: providerPhone,
        role: 'PROVIDER',
        isVerified: true,
      }
    });

    providerProfile = await prisma.providerProfile.create({
      data: {
        id: crypto.randomUUID(),
        userId: providerUser.id,
        cpfCnpj: '123' + Math.random().toString().slice(2, 10),
        startHour: '08:00',
        endHour: '18:00',
        tier: 'OURO',
        bankCode: '001',
        bankBranch: '1234',
        bankAccount: '56789',
        bankAccountDigit: '0',
        pagarmeRecipientId: 're_test_' + crypto.randomBytes(4).toString('hex')
      }
    });
  } else {
    // UPDATE existing one with bank data
    providerProfile = await prisma.providerProfile.update({
      where: { id: providerProfile.id },
      data: {
        bankCode: '001',
        bankBranch: '1234',
        bankAccount: '56789',
        bankAccountDigit: '0',
        pagarmeRecipientId: 're_test_' + crypto.randomBytes(4).toString('hex')
      }
    });
  }

  console.log('Using provider:', providerProfile.id);

  // 3. Create PENDING_APPROVAL payouts
  await prisma.payout.createMany({
    data: [
      {
        id: crypto.randomUUID(),
        providerId: providerProfile.id,
        amount: 250000n,
        fee: 0n,
        status: 'PENDING_APPROVAL',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        providerId: providerProfile.id,
        amount: 320000n,
        fee: 0n,
        status: 'PENDING_APPROVAL',
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(),
      }
    ]
  });

  console.log('Seed completed: 2 pending payouts created.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
