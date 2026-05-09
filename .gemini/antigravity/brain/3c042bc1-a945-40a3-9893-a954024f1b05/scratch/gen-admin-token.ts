import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({ where: { phone: '5511999999999' } });
  if (!admin) {
    console.error('Admin not found');
    return;
  }

  const payload = { sub: admin.id, role: admin.role };
  const token = jwt.sign(payload, 'super-secret-development-key', { expiresIn: '7d' });
  console.log('TOKEN_START');
  console.log(token);
  console.log('TOKEN_END');
}

main().catch(console.error).finally(() => prisma.$disconnect());
