import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/modules/identity/application/auth.service';
import { PrismaClient } from '@prisma/client';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);
  const prisma = new PrismaClient();

  const phone = '+5511666666666';
  const inviteCode = 'CONVITE123';

  console.log(`Registering ${phone} with code ${inviteCode}...`);
  await authService.verifyOtp(phone, '123456', inviteCode);
  
  const user = await prisma.user.findUnique({
    where: { phone }
  });

  console.log('User created:', JSON.stringify(user, null, 2));
  console.log('InvitedById:', user?.invitedById);

  if (!user?.invitedById) {
    console.log('SUCCESS: Referral linking BLOCKED due to limit.');
  } else {
    console.log('FAILURE: Referral linking ALLOWED despite limit.');
  }

  await app.close();
  await prisma.$disconnect();
}

main().catch(console.error);
