import { SecurityService } from './security.service';

describe('SecurityService', () => {
  let service: SecurityService;

  beforeEach(() => {
    // Set a deterministic encryption key for tests (64 hex chars = 32 bytes)
    process.env.ENCRYPTION_KEY = 'a'.repeat(64);
    process.env.HASH_SALT = 'test-salt';
    service = new SecurityService();
  });

  describe('encrypt() / decrypt() roundtrip', () => {
    it('should decrypt an encrypted string back to the original', () => {
      const original = '12345678900'; // CPF
      const encrypted = service.encrypt(original);
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(original);
    });

    it('should produce different ciphertext for the same input (random IV)', () => {
      const original = 'sensitive-data';
      const encrypted1 = service.encrypt(original);
      const encrypted2 = service.encrypt(original);
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty string', () => {
      const original = '';
      const encrypted = service.encrypt(original);
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(original);
    });

    it('should handle unicode strings', () => {
      const original = 'João da Silva — dados bancários 💰';
      const encrypted = service.encrypt(original);
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(original);
    });
  });

  describe('hash()', () => {
    it('should produce a deterministic hash for the same input', () => {
      const hash1 = service.hash('test-input');
      const hash2 = service.hash('test-input');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = service.hash('input-a');
      const hash2 = service.hash('input-b');
      expect(hash1).not.toBe(hash2);
    });

    it('should return a hex string of 64 characters (SHA-256)', () => {
      const hash = service.hash('any-input');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
