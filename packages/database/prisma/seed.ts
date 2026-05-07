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

const cities = [
  { 
    name: 'São Paulo', slug: 'sao-paulo', ibgeCode: '3550308', state: 'SP',
    neighborhoods: [
      { name: 'Centro Histórico', slug: 'centro-historico' },
      { name: 'Moema', slug: 'moema' },
      { name: 'Pinheiros', slug: 'pinheiros' },
      { name: 'Vila Mariana', slug: 'vila-mariana' },
      { name: 'Santana', slug: 'santana' },
    ]
  },
  {
    name: 'Rio de Janeiro', slug: 'rio-de-janeiro', ibgeCode: '3304557', state: 'RJ',
    neighborhoods: [
      { name: 'Copacabana', slug: 'copacabana' },
      { name: 'Botafogo', slug: 'botafogo' },
      { name: 'Tijuca', slug: 'tijuca' },
      { name: 'Barra da Tijuca', slug: 'barra-da-tijuca' },
      { name: 'Centro', slug: 'centro-rj' },
    ]
  }
];

async function main() {
  console.log('Seeding cities and neighborhoods...');
  for (const city of cities) {
    const createdCity = await prisma.city.upsert({
      where: { slug: city.slug },
      update: {},
      create: {
        name: city.name,
        slug: city.slug,
        ibgeCode: city.ibgeCode,
        state: city.state,
      },
    });

    for (const neighborhood of city.neighborhoods) {
      await prisma.neighborhood.upsert({
        where: { slug: neighborhood.slug },
        update: {},
        create: {
          name: neighborhood.name,
          slug: neighborhood.slug,
          cityId: createdCity.id,
        },
      });
    }
  }

  const allCities = await prisma.city.findMany();

  console.log('Seeding categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        activeCities: {
          connect: allCities.map(c => ({ id: c.id }))
        }
      },
      create: {
        ...cat,
        activeCities: {
          connect: allCities.map(c => ({ id: c.id }))
        }
      },
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
