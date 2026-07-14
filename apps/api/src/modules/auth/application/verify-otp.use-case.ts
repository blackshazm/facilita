// PRD: 2.4 Usuários e Personas
// PRD: 4.2.1 App do Cliente - Onboarding
import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REPOSITORY, AuthRepositoryPort } from '../ports/auth.repository.port';
import { TOKEN_SERVICE, TokenServicePort } from '../ports/auth.service.port';
import { USER_REPOSITORY, UserRepositoryPort } from '../../users/ports/user.repository.port';

export class VerifyOtpDto {
  phone: string;
  otpCode: string;
}

@Injectable()
export class VerifyOtpUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryPort,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenServicePort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(dto: VerifyOtpDto): Promise<{ token: string; isNewUser: boolean }> {
    const session = await this.authRepository.getOtpSession(dto.phone);
    if (!session) {
      throw new Error('OTP session not found or expired');
    }

    const isValid = session.verify(dto.otpCode);
    if (!isValid) {
      throw new Error('Invalid OTP code');
    }

    await this.authRepository.deleteOtpSession(dto.phone);

    let user = await this.userRepository.findByPhone(dto.phone);
    const isNewUser = !user;

    if (!user) {
      // Create partial user. The rest is filled in next onboarding steps.
      // We will need a CreateUserUseCase integration here, but for now we just use port.
      throw new Error('User not found. Redirect to signup flow.');
    }

    const token = await this.tokenService.generateToken(user.id, user.role);
    return { token, isNewUser };
  }
}
