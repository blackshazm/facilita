import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../core/user.entity';
import { RolesGuard } from './guards/roles.guard';

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

  @Get('admin/ping')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async adminPing() {
    return { message: 'Admin access confirmed' };
  }
}
