const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const city = await prisma.city.findFirst({ where: { slug: 'sao-paulo' } });
  console.log(city.id);
  process.exit(0);
}

main();
