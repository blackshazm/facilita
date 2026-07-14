// PRD: 2.4 Usuários e Personas
export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');
export const SMS_SERVICE = Symbol('SMS_SERVICE');

export interface TokenServicePort {
  generateToken(userId: string, role: string): Promise<string>;
  verifyToken(token: string): Promise<{ userId: string; role: string }>;
}

export interface SmsServicePort {
  sendSms(phone: string, message: string): Promise<void>;
}
