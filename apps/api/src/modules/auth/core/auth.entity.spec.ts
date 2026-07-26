import { OtpSession, AuthToken } from './auth.entity';

describe('Auth Entities', () => {
  describe('OtpSession', () => {
    it('should verify a correct OTP code', () => {
      const session = new OtpSession(
        '+5511999999999',
        '123456',
        new Date(Date.now() + 5 * 60 * 1000), // expires in 5 min
      );

      const result = session.verify('123456');
      expect(result).toBe(true);
      expect(session.isVerified).toBe(true);
    });

    it('should reject an incorrect OTP code', () => {
      const session = new OtpSession(
        '+5511999999999',
        '123456',
        new Date(Date.now() + 5 * 60 * 1000),
      );

      const result = session.verify('000000');
      expect(result).toBe(false);
      expect(session.isVerified).toBe(false);
    });

    it('should throw an error if OTP is expired', () => {
      const session = new OtpSession(
        '+5511999999999',
        '123456',
        new Date(Date.now() - 1000), // already expired
      );

      expect(() => session.verify('123456')).toThrow('OTP expired');
    });

    it('should start as not verified', () => {
      const session = new OtpSession(
        '+5511999999999',
        '123456',
        new Date(Date.now() + 5 * 60 * 1000),
      );

      expect(session.isVerified).toBe(false);
    });
  });

  describe('AuthToken', () => {
    it('should store token and expiration', () => {
      const expiresAt = new Date('2025-12-31');
      const authToken = new AuthToken('jwt-token-abc', expiresAt);
      
      expect(authToken.token).toBe('jwt-token-abc');
      expect(authToken.expiresAt).toEqual(expiresAt);
    });
  });
});
