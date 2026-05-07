const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { phone: '5511999999999' },
    update: {},
    create: {
      phone: '5511999999999',
      name: 'Test Provider',
      role: 'PROVIDER',
    },
  });

  const profile = await prisma.providerProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      cpfCnpj: '12345678901',
      startHour: '08:00',
      endHour: '18:00',
    },
  });

  console.log(profile.id);
  process.exit(0);
}

main();
