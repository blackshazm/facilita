export interface ISmsService {
  sendOtp(phone: string): Promise<boolean>;
  verifyOtp(phone: string, code: string): Promise<boolean>;
}

export const SMS_SERVICE = Symbol('ISmsService');
