import { TwilioSmsAdapter, normalizePhoneNumber } from './twilio-sms.adapter';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TwilioSmsAdapter & Phone Normalization', () => {
  let adapter: TwilioSmsAdapter;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    adapter = new TwilioSmsAdapter();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('normalizePhoneNumber', () => {
    it('should format 11-digit Brazilian mobile numbers to E.164 (+5511999999999)', () => {
      expect(normalizePhoneNumber('11999999999')).toBe('+5511999999999');
      expect(normalizePhoneNumber('(11) 99999-9999')).toBe('+5511999999999');
      expect(normalizePhoneNumber('+55 (11) 99999-9999')).toBe('+5511999999999');
    });

    it('should handle numbers already starting with 55 without plus sign', () => {
      expect(normalizePhoneNumber('5511999999999')).toBe('+5511999999999');
    });

    it('should preserve international numbers with + prefix', () => {
      expect(normalizePhoneNumber('+14155552671')).toBe('+14155552671');
    });

    it('should return empty string for empty input', () => {
      expect(normalizePhoneNumber('')).toBe('');
    });
  });

  describe('sendSms', () => {
    it('should dispatch via Twilio API when credentials are provided', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'ACmock123';
      process.env.TWILIO_AUTH_TOKEN = 'mockToken';
      process.env.TWILIO_PHONE_NUMBER = '+15005550006';

      mockedAxios.post.mockResolvedValueOnce({ data: { sid: 'SM123' } } as any);

      await adapter.sendSms('11999999999', 'Seu código é 123456');

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      const call = mockedAxios.post.mock.calls[0];
      expect(call[0]).toContain('https://api.twilio.com/2010-04-01/Accounts/ACmock123/Messages.json');
      expect(call[1]).toContain('To=%2B5511999999999');
      expect(call[1]).toContain('From=%2B15005550006');
    });

    it('should fallback to Z-API WhatsApp when Twilio is absent and Z-API is configured', async () => {
      delete process.env.TWILIO_ACCOUNT_SID;
      process.env.ZAPI_INSTANCE_ID = 'zapi123';
      process.env.ZAPI_TOKEN = 'token123';

      mockedAxios.post.mockResolvedValueOnce({ data: { messageId: 'wa123' } } as any);

      await adapter.sendSms('(11) 98888-7777', 'Código WhatsApp: 654321');

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      const [url, body] = mockedAxios.post.mock.calls[0];
      expect(url).toBe('https://api.z-api.io/instances/zapi123/token/token123/send-text');
      expect(body).toEqual({
        phone: '5511988887777',
        message: 'Código WhatsApp: 654321',
      });
    });

    it('should gracefully simulate in dev/test when no credentials are provided without throwing', async () => {
      delete process.env.TWILIO_ACCOUNT_SID;
      delete process.env.ZAPI_INSTANCE_ID;

      await expect(adapter.sendSms('11999999999', 'Código teste')).resolves.toBeUndefined();
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });
});
