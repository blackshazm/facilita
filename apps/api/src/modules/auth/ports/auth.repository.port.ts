// PRD: 2.4 Usuários e Personas
import { OtpSession } from '../core/auth.entity';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface AuthRepositoryPort {
  saveOtpSession(session: OtpSession): Promise<void>;
  getOtpSession(phone: string): Promise<OtpSession | null>;
  deleteOtpSession(phone: string): Promise<void>;
}
