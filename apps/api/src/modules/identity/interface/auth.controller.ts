import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../application/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  async requestOtp(@Body() body: { phone: string }) {
    await this.authService.requestOtp(body.phone);
    return { message: 'OTP sent via WhatsApp' };
  }

  @Post('otp/verify')
  async verifyOtp(@Body() body: { phone: string, code: string }) {
    return this.authService.verifyOtp(body.phone, body.code);
  }
}
