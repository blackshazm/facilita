import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ISmsService, SMS_SERVICE } from '../domain/interfaces/sms.service.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {
  constructor(
    @Inject(SMS_SERVICE) private readonly smsService: ISmsService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async requestOtp(phone: string): Promise<boolean> {
    return this.smsService.sendOtp(phone);
  }

  async verifyOtp(phone: string, code: string): Promise<{ accessToken: string }> {
    const isValid = await this.smsService.verifyOtp(phone, code);
    if (!isValid) throw new Error('Invalid OTP');
    
    // TODO: Create or get user from repository
    const userId = 'placeholder-uuid';
    const role: string = 'CUSTOMER';

    const payload = { sub: userId, role };
    const accessToken = this.jwtService.sign(payload);

    if (role === 'PROVIDER') {
      this.eventEmitter.emit('provider.online', { providerId: userId });
    }

    return { accessToken };
  }
}
