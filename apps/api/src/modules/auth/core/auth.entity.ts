// PRD: 2.4 Usuários e Personas
// PRD: 4.2 Arquitetura de Informação - Onboarding

export class AuthToken {
  constructor(
    public readonly token: string,
    public readonly expiresAt: Date,
  ) {}
}

export class OtpSession {
  constructor(
    public readonly phone: string,
    public readonly otpCode: string,
    public readonly expiresAt: Date,
    public isVerified: boolean = false,
  ) {}

  verify(code: string): boolean {
    if (new Date() > this.expiresAt) throw new Error('OTP expired');
    if (this.otpCode !== code) return false;
    this.isVerified = true;
    return true;
  }
}
