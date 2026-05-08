import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { GetUserUseCase } from '../application/get-user.usecase';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../core/user.entity';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

  @Post('otp/request')
  async requestOtp(@Body() body: { phone: string }) {
    await this.authService.requestOtp(body.phone);
    return { message: 'OTP sent via WhatsApp' };
  }

  @Post('otp/verify')
  async verifyOtp(@Body() body: { phone: string, code: string, inviteCode?: string, deviceId?: string }) {
    return this.authService.verifyOtp(body.phone, body.code, body.inviteCode, body.deviceId);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req: any) {
    return this.getUserUseCase.execute(req.user.userId);
  }

  @Get('admin/ping')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async adminPing() {
    return { message: 'Admin access confirmed' };
  }
}
