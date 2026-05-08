import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { phone: '+5511999999999' }
  });

  if (!user) {
    console.error('User not found');
    return;
  }

  await prisma.userDevice.upsert({
    where: { pushToken: 'test-token-1' },
    update: { deviceId: 'test-device-id' },
    create: {
      userId: user.id,
      pushToken: 'test-token-1',
      deviceId: 'test-device-id',
      platform: 'ios'
    }
  });

  console.log('Device associated with user');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
