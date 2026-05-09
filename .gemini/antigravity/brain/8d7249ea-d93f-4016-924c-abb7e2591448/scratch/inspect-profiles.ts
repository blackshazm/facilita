import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.providerProfile.findMany();
  console.log(JSON.stringify(profiles, null, 2));
}

main().finally(() => prisma.$disconnect());
