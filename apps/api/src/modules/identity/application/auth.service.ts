import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ISmsService, SMS_SERVICE } from '../domain/interfaces/sms.service.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_REPOSITORY_PORT, UserRepositoryPort } from '../ports/user-repository.port';
import { User, UserRole } from '../core/user.entity';
import { generateInviteCode, regenerateWithMoreRandomness } from '../core/invite-code.util';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @Inject(SMS_SERVICE) private readonly smsService: ISmsService,
    @Inject(USER_REPOSITORY_PORT) private readonly userRepository: UserRepositoryPort,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async requestOtp(phone: string): Promise<boolean> {
    return this.smsService.sendOtp(phone);
  }

  async verifyOtp(phone: string, otp: string, inviteCode?: string, deviceId?: string): Promise<{ accessToken: string }> {
    const isValid = await this.smsService.verifyOtp(phone, otp);
    if (!isValid) throw new Error('Invalid OTP');
    
    let user = await this.userRepository.findByPhone(phone);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = new User({
        id: uuid(),
        phone,
        role: UserRole.CUSTOMER,
        isVerified: true,
        referralCount: 0,
        referralLimit: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Handle Referrer
      if (inviteCode) {
        const referrer = await this.userRepository.findByInviteCode(inviteCode.toUpperCase());
        if (referrer && referrer.referralCount < referrer.referralLimit) {
          // Sybil Detection
          if (deviceId) {
            const referrerDeviceIds = await this.userRepository.findDeviceIdsByUserId(referrer.id);
            if (!referrerDeviceIds.includes(deviceId)) {
              user.setInvitedBy(referrer.id);
            }
          } else {
            user.setInvitedBy(referrer.id);
          }
        }
      }

      // Collision-proof Invite Code Generation
      let code = generateInviteCode(user.phone); // Fallback to phone if name is missing
      let attempts = 0;
      while (attempts < 3) {
        const existing = await this.userRepository.findByInviteCode(code);
        if (!existing) {
          user.setInviteCode(code);
          break;
        }
        code = regenerateWithMoreRandomness(code);
        attempts++;
      }

      await this.userRepository.save(user);
    }

    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    if (user.isProvider()) {
      this.eventEmitter.emit('provider.online', { providerId: user.id });
    }

    return { accessToken };
  }
}
