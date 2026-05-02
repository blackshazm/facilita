import { Injectable } from '@nestjs/common';
import { ISmsService } from '../domain/interfaces/sms.service.interface';

@Injectable()
export class TwilioSmsService implements ISmsService {
  async sendOtp(phone: string): Promise<boolean> {
    console.log(`Sending WhatsApp OTP to ${phone}`);
    // Twilio SDK logic goes here
    return true;
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    console.log(`Verifying OTP ${code} for ${phone}`);
    // Twilio SDK logic goes here
    return code === '123456'; // mock
  }
}
