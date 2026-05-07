const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const neighborhood = await prisma.neighborhood.findFirst({ 
    where: { city: { slug: 'sao-paulo' } } 
  });
  console.log(neighborhood.id);
  process.exit(0);
}

main();
