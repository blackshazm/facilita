import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ISmsService, SMS_SERVICE } from '../domain/interfaces/sms.service.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(SMS_SERVICE) private readonly smsService: ISmsService,
    private readonly jwtService: JwtService
  ) {}

  async requestOtp(phone: string): Promise<boolean> {
    return this.smsService.sendOtp(phone);
  }

  async verifyOtp(phone: string, code: string): Promise<{ accessToken: string }> {
    const isValid = await this.smsService.verifyOtp(phone, code);
    if (!isValid) throw new Error('Invalid OTP');
    
    // TODO: Create or get user from repository
    const userId = 'placeholder-uuid';
    const role = 'CUSTOMER';

    const payload = { sub: userId, role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
