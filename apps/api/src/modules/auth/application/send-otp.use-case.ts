// PRD: 2.4 Usuários e Personas
// PRD: 4.2.1 App do Cliente - Onboarding
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { OtpSession } from '../core/auth.entity';
import { AUTH_REPOSITORY, AuthRepositoryPort } from '../ports/auth.repository.port';
import { OTP_RATE_LIMITER, OtpRateLimiterPort, SMS_SERVICE, SmsServicePort } from '../ports/auth.service.port';
import { normalizePhoneNumber } from '../adapters/twilio-sms.adapter';

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
    @Inject(OTP_RATE_LIMITER)
    private readonly rateLimiter: OtpRateLimiterPort,
  ) {}

  async execute(dto: SendOtpDto): Promise<{ success: boolean; remainingAttempts?: number }> {
    const normalizedPhone = normalizePhoneNumber(dto.phone);
    if (!normalizedPhone) {
      throw new HttpException('Número de telefone inválido.', HttpStatus.BAD_REQUEST);
    }

    // Validação estrita de Rate Limiting anti-abuso / anti-bot
    const rateLimit = await this.rateLimiter.checkAndIncrement(normalizedPhone);
    if (!rateLimit.allowed) {
      const waitMinutes = rateLimit.retryAfterSeconds ? Math.ceil(rateLimit.retryAfterSeconds / 60) : 10;
      throw new HttpException(
        `Limite de tentativas de envio excedido. Aguarde ${waitMinutes} minutos antes de solicitar um novo código SMS.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Geração segura de OTP (6 dígitos numéricos)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos de validade

    const session = new OtpSession(normalizedPhone, otpCode, expiresAt);
    await this.authRepository.saveOtpSession(session);

    // Despacho do SMS / WhatsApp através da porta de serviço
    await this.smsService.sendSms(
      normalizedPhone,
      `FACILITA: Seu código de segurança é ${otpCode}. Válido por 5 minutos. Não compartilhe com ninguém.`,
    );

    return {
      success: true,
      remainingAttempts: rateLimit.remainingAttempts,
    };
  }
}
