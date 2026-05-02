const fs = require('fs');
const path = require('path');

const dirs = [
  'packages/database/prisma',
  'packages/event-bus',
  'packages/ui',
  'apps/api/src/modules/identity/domain',
  'apps/api/src/modules/identity/application',
  'apps/api/src/modules/identity/infrastructure',
  'apps/api/src/modules/identity/interface',
  'apps/api/src/modules/catalog/domain',
  'apps/api/src/modules/catalog/application',
  'apps/api/src/modules/catalog/infrastructure',
  'apps/api/src/modules/catalog/interface',
  'apps/api/src/modules/matching/domain',
  'apps/api/src/modules/matching/application',
  'apps/api/src/modules/matching/infrastructure',
  'apps/api/src/modules/matching/interface',
  'apps/api/src/modules/orders/domain',
  'apps/api/src/modules/orders/application',
  'apps/api/src/modules/orders/infrastructure',
  'apps/api/src/modules/orders/interface',
  'apps/api/src/modules/payments/domain',
  'apps/api/src/modules/payments/application',
  'apps/api/src/modules/payments/infrastructure',
  'apps/api/src/modules/payments/interface',
  'apps/api/src/modules/evidence/domain',
  'apps/api/src/modules/evidence/application',
  'apps/api/src/modules/evidence/infrastructure',
  'apps/api/src/modules/evidence/interface',
  'apps/api/src/modules/fraud/domain',
  'apps/api/src/modules/fraud/application',
  'apps/api/src/modules/fraud/infrastructure',
  'apps/api/src/modules/fraud/interface',
  'apps/api/src/modules/disputes/domain',
  'apps/api/src/modules/disputes/application',
  'apps/api/src/modules/disputes/infrastructure',
  'apps/api/src/modules/disputes/interface',
  'apps/api/src/shared-kernel',
  'apps/client',
  'apps/provider',
  '.github/workflows'
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

console.log('Scaffolding complete');
