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

  console.log('Seeding official 13 canonical v4.1 services...');
  const eletricistaCat = await prisma.category.findUnique({ where: { slug: 'eletricista' } });
  const encanadorCat = await prisma.category.findUnique({ where: { slug: 'encanador' } });
  const reparosCat = await prisma.category.findUnique({ where: { slug: 'marido-aluguel' } });

  const officialServices = [
    // 1. Eletricista (6 serviços)
    {
      categoryId: eletricistaCat?.id,
      name: 'Instalação de Chuveiro Elétrico',
      description: 'Fixação, fiação de proteção e teste de aquecimento seguro. Não inclui chuveiro.',
      basePrice: 120.0,
      serviceCode: 'CHUVEIRO',
      cityServiceCode: '14.01',
    },
    {
      categoryId: eletricistaCat?.id,
      name: 'Troca de Torneira Elétrica',
      description: 'Substituição com mão de obra especializada e vedação básica. Não inclui torneira.',
      basePrice: 100.0,
      serviceCode: 'TORNEIRA_ELETRICA',
      cityServiceCode: '14.01',
    },
    {
      categoryId: eletricistaCat?.id,
      name: 'Instalação de Ventilador de Teto',
      description: 'Montagem e fixação com balanceamento em ponto elétrico existente.',
      basePrice: 150.0,
      serviceCode: 'VENTILADOR',
      cityServiceCode: '14.01',
    },
    {
      categoryId: eletricistaCat?.id,
      name: 'Troca de Disjuntor no Quadro',
      description: 'Substituição com segurança no quadro elétrico. Exige certificação técnica NR-10.',
      basePrice: 90.0,
      serviceCode: 'DISJUNTOR',
      cityServiceCode: '14.01',
    },
    {
      categoryId: eletricistaCat?.id,
      name: 'Instalação de Lustre / Luminária',
      description: 'Instalação ou troca de até 3 pontos de luz em teto ou parede.',
      basePrice: 80.0,
      serviceCode: 'LUMINARIA',
      cityServiceCode: '14.01',
    },
    {
      categoryId: eletricistaCat?.id,
      name: 'Instalação de Tomada / Interruptor',
      description: 'Instalação ou troca de até 3 tomadas ou interruptores residenciais.',
      basePrice: 110.0,
      serviceCode: 'TOMADA',
      cityServiceCode: '14.01',
    },

    // 2. Encanador (5 serviços)
    {
      categoryId: encanadorCat?.id,
      name: 'Reparo de Vazamento em Torneira ou Sifão',
      description: 'Troca de vedações, reparo de conexões ou substituição do sifão.',
      basePrice: 110.0,
      serviceCode: 'VAZAMENTO_SIFAO',
      cityServiceCode: '14.02',
    },
    {
      categoryId: encanadorCat?.id,
      name: 'Desentupimento de Pia ou Ralo',
      description: 'Desobstrução mecânica de tubulação de esgoto residencial até 5 metros.',
      basePrice: 130.0,
      serviceCode: 'DESENTUPIMENTO_PIA',
      cityServiceCode: '14.02',
    },
    {
      categoryId: encanadorCat?.id,
      name: 'Desentupimento de Vaso Sanitário',
      description: 'Desobstrução do vaso sanitário com equipamento profissional.',
      basePrice: 160.0,
      serviceCode: 'DESENTUPIMENTO_VASO',
      cityServiceCode: '14.02',
    },
    {
      categoryId: encanadorCat?.id,
      name: 'Troca de Registro Geral ou Válvula Hydra',
      description: 'Reparo ou substituição de reparo de descarga ou registro de gaveta.',
      basePrice: 180.0,
      serviceCode: 'REGISTRO_VALVULA',
      cityServiceCode: '14.02',
    },
    {
      categoryId: encanadorCat?.id,
      name: 'Instalação de Boia de Caixa d\'Água',
      description: 'Substituição de boia mecânica e verificação de ladrão e extravasor.',
      basePrice: 200.0,
      serviceCode: 'BOIA_CAIXA',
      cityServiceCode: '14.02',
    },

    // 3. Pequenos Reparos / Marido de Aluguel (2 serviços)
    {
      categoryId: reparosCat?.id,
      name: 'Montagem de Móveis (até 2m)',
      description: 'Montagem de estantes, cômodas, mesas ou armários pequenos comprados prontos.',
      basePrice: 130.0,
      serviceCode: 'MONTAGEM_MOVEIS',
      cityServiceCode: '14.03',
    },
    {
      categoryId: reparosCat?.id,
      name: 'Instalação de Suporte de TV / Prateleiras',
      description: 'Fixação com buchas adequadas para alvenaria ou drywall de até 2 itens.',
      basePrice: 100.0,
      serviceCode: 'SUPORTE_TV',
      cityServiceCode: '14.03',
    },
  ];

  for (const srv of officialServices) {
    if (!srv.categoryId) continue;

    const existing = await prisma.service.findFirst({
      where: { serviceCode: srv.serviceCode },
    });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          name: srv.name,
          description: srv.description,
          basePrice: srv.basePrice,
          categoryId: srv.categoryId,
          cityServiceCode: srv.cityServiceCode,
        },
      });
    } else {
      await prisma.service.create({
        data: {
          name: srv.name,
          description: srv.description,
          basePrice: srv.basePrice,
          categoryId: srv.categoryId,
          serviceCode: srv.serviceCode,
          cityServiceCode: srv.cityServiceCode,
        },
      });
    }
  }

  console.log('Seed complete with 13 canonical services.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
