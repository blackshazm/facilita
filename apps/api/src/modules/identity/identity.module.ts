import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './interface/auth.controller';
import { AuthService } from './application/auth.service';
import { TwilioSmsService } from './infrastructure/twilio-sms.service';
import { SMS_SERVICE } from './domain/interfaces/sms.service.interface';
import { JwtStrategy } from '../../shared-kernel/strategies/jwt.strategy';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { USER_REPOSITORY_PORT } from './ports/user-repository.port';
import { PrismaUserRepository } from './adapters/prisma-user-repository.adapter';
import { GetUserUseCase } from './application/get-user.usecase';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    GetUserUseCase,
    {
      provide: SMS_SERVICE,
      useClass: TwilioSmsService,
    },
    {
      provide: USER_REPOSITORY_PORT,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY_PORT, GetUserUseCase],
})
export class IdentityModule {}
