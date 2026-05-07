const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const providerId = '70353cc4-8c5e-4466-86cc-9ef45091728a';
  const neighborhoodId = 'c1ec6f0f-bada-4aae-99ed-8428bb72e174';
  const categorySlug = 'eletricista';

  console.log('--- Verification Phase 7.2 ---');

  // 1. Update Service Zones
  console.log(`Updating Provider ${providerId} with Neighborhood ${neighborhoodId}...`);
  await prisma.providerProfile.update({
    where: { id: providerId },
    data: {
      serviceZones: {
        set: [{ id: neighborhoodId }]
      }
    }
  });

  // 2. Verify Database Relation
  const updatedProvider = await prisma.providerProfile.findUnique({
    where: { id: providerId },
    include: { serviceZones: true }
  });
  console.log('Provider Service Zones:', updatedProvider.serviceZones.map(z => z.name));
  
  if (updatedProvider.serviceZones.some(z => z.id === neighborhoodId)) {
    console.log('✅ Service Zones updated successfully.');
  } else {
    console.log('❌ Service Zones update failed.');
    process.exit(1);
  }

  // 3. Verify Matching Logic
  // We need an ActiveProvider record for this provider and category
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  
  console.log(`Setting Provider ${providerId} as Online for Category ${categorySlug}...`);
  await prisma.activeProvider.upsert({
    where: { providerId: providerId },
    update: { isOnline: true, categoryId: category.id },
    create: {
      providerId: providerId,
      isOnline: true,
      categoryId: category.id
    }
  });

  // Now we simulate the query that MatchingEngineAdapter does
  const results = await prisma.activeProvider.findMany({
    where: {
      categoryId: category.id,
      isOnline: true,
      providerId: {
        in: (
          await prisma.providerProfile.findMany({
            where: {
              serviceZones: {
                some: {
                  id: neighborhoodId
                }
              }
            },
            select: { id: true }
          })
        ).map(p => p.id)
      }
    }
  });

  console.log('Matched Providers count:', results.length);
  if (results.some(r => r.providerId === providerId)) {
    console.log('✅ Matching Engine correctly found the provider in the neighborhood.');
  } else {
    console.log('❌ Matching Engine failed to find the provider.');
    process.exit(1);
  }

  console.log('--- Verification Complete ---');
  process.exit(0);
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});
