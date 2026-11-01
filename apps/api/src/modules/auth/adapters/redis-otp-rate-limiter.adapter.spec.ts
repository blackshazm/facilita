import { RedisOtpRateLimiterAdapter } from './redis-otp-rate-limiter.adapter';

describe('RedisOtpRateLimiterAdapter', () => {
  let rateLimiter: RedisOtpRateLimiterAdapter;

  beforeEach(() => {
    rateLimiter = new RedisOtpRateLimiterAdapter();
  });

  afterEach(async () => {
    await rateLimiter.onModuleDestroy();
  });

  it('should allow up to 3 OTP requests within the window', async () => {
    const phone = '+5511999990001';
    rateLimiter.reset(phone);

    const first = await rateLimiter.checkAndIncrement(phone);
    expect(first.allowed).toBe(true);
    expect(first.remainingAttempts).toBe(2);

    const second = await rateLimiter.checkAndIncrement(phone);
    expect(second.allowed).toBe(true);
    expect(second.remainingAttempts).toBe(1);

    const third = await rateLimiter.checkAndIncrement(phone);
    expect(third.allowed).toBe(true);
    expect(third.remainingAttempts).toBe(0);
  });

  it('should block the 4th OTP request and indicate retryAfterSeconds', async () => {
    const phone = '+5511999990002';
    rateLimiter.reset(phone);

    await rateLimiter.checkAndIncrement(phone);
    await rateLimiter.checkAndIncrement(phone);
    await rateLimiter.checkAndIncrement(phone);

    const fourth = await rateLimiter.checkAndIncrement(phone);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remainingAttempts).toBe(0);
    expect(fourth.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('should isolate rate limits across different phone numbers', async () => {
    const phoneA = '+5511999990003';
    const phoneB = '+5511999990004';
    rateLimiter.reset(phoneA);
    rateLimiter.reset(phoneB);

    await rateLimiter.checkAndIncrement(phoneA);
    await rateLimiter.checkAndIncrement(phoneA);
    await rateLimiter.checkAndIncrement(phoneA);

    const phoneABlocked = await rateLimiter.checkAndIncrement(phoneA);
    expect(phoneABlocked.allowed).toBe(false);

    const phoneBAllowed = await rateLimiter.checkAndIncrement(phoneB);
    expect(phoneBAllowed.allowed).toBe(true);
    expect(phoneBAllowed.remainingAttempts).toBe(2);
  });
});
