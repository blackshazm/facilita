// PRD: 2.4 Usuários e Personas
// PRD: 4.2.1 App do Cliente - Onboarding
import { Inject, Injectable } from '@nestjs/common';
import { OtpSession } from '../core/auth.entity';
import { AUTH_REPOSITORY, AuthRepositoryPort } from '../ports/auth.repository.port';
import { SMS_SERVICE, SmsServicePort } from '../ports/auth.service.port';

export class SendOtpDto {
  phone: string;
}

@Injectable()
export class SendOtpUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryPort,
    @Inject(SMS_SERVICE)
    private readonly smsService: SmsServicePort,
  ) {}

  async execute(dto: SendOtpDto): Promise<void> {
    // Basic OTP generation
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const session = new OtpSession(dto.phone, otpCode, expiresAt);
    await this.authRepository.saveOtpSession(session);

    // MOCK: Actually send SMS in production
    await this.smsService.sendSms(dto.phone, `Seu código FACILITA é: ${otpCode}`);
    
    // Log for local dev
    console.log(`[DEV OTP] Phone: ${dto.phone} Code: ${otpCode}`);
  }
}
