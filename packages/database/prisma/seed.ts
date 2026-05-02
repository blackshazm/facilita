import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Eletricista', slug: 'eletricista', description: 'Serviços elétricos em geral' },
  { name: 'Encanador', slug: 'encanador', description: 'Serviços hidráulicos e tubulações' },
  { name: 'Pintor', slug: 'pintor', description: 'Pintura residencial e comercial' },
  { name: 'Marceneiro', slug: 'marceneiro', description: 'Móveis e reparos em madeira' },
  { name: 'Chaveiro', slug: 'chaveiro', description: 'Abertura de portas e cópias de chaves' },
  { name: 'Pedreiro', slug: 'pedreiro', description: 'Construção e reformas' },
  { name: 'Técnico de Ar Condicionado', slug: 'ar-condicionado', description: 'Instalação e manutenção de AC' },
  { name: 'Montador de Móveis', slug: 'montador-moveis', description: 'Montagem de móveis comprados prontos' },
  { name: 'Limpeza/Diarista', slug: 'limpeza', description: 'Serviços de limpeza residencial' },
  { name: 'Jardineiro', slug: 'jardineiro', description: 'Cuidado de jardins e gramados' },
  { name: 'Marido de Aluguel', slug: 'marido-aluguel', description: 'Pequenos reparos diversos' },
  { name: 'Vidraceiro', slug: 'vidraceiro', description: 'Instalação e troca de vidros' },
  { name: 'Gesseiro', slug: 'gesseiro', description: 'Forros e paredes de gesso' },
];

async function main() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
