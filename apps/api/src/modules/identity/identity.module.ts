import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './interface/auth.controller';
import { AuthService } from './application/auth.service';
import { TwilioSmsService } from './infrastructure/twilio-sms.service';
import { SMS_SERVICE } from './domain/interfaces/sms.service.interface';
import { JwtStrategy } from '../../shared-kernel/strategies/jwt.strategy';

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
    {
      provide: SMS_SERVICE,
      useClass: TwilioSmsService,
    },
  ],
})
export class IdentityModule {}
