import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = '0072e115-2aca-4835-a113-3a57564c5625'; // Referrer
  
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'PROVIDER' }
  });

  const randomCpf = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');

  await prisma.providerProfile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      cpfCnpj: randomCpf,
      startHour: '08:00',
      endHour: '18:00',
      availableDays: [1, 2, 3, 4, 5],
    }
  });

  console.log(`User converted to PROVIDER and profile created with CPF ${randomCpf}.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
