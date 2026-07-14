// PRD: 2.4 Usuários e Personas
// PRD: 4.2.1 App do Cliente - Onboarding
import { Body, Controller, Post } from '@nestjs/common';
import { SendOtpUseCase } from './send-otp.use-case';
import { VerifyOtpUseCase } from './verify-otp.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly sendOtpUseCase: SendOtpUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
  ) {}

  @Post('send-otp')
  async sendOtp(@Body() body: { phone: string }) {
    await this.sendOtpUseCase.execute({ phone: body.phone });
    return { success: true, message: 'OTP sent' };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { phone: string; otpCode: string }) {
    const result = await this.verifyOtpUseCase.execute(body);
    return { success: true, ...result };
  }
}
