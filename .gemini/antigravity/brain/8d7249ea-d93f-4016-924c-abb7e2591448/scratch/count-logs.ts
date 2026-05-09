import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.financialAuditLog.count();
  console.log('TOTAL LOGS:', count);
  const allLogs = await prisma.financialAuditLog.findMany({ select: { action: true } });
  console.log('ACTIONS:', allLogs.map(l => l.action));
}

main().finally(() => prisma.$disconnect());
