import { ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { IdempotencyInterceptor } from './idempotency.interceptor';

describe('IdempotencyInterceptor', () => {
  let interceptor: IdempotencyInterceptor;

  beforeEach(() => {
    interceptor = new IdempotencyInterceptor();
  });

  afterEach(async () => {
    await interceptor.onModuleDestroy();
  });

  function createMockContext(method: string, headers: Record<string, string>, initialStatusCode = 200) {
    const resHeaders: Record<string, string> = {};
    let statusCode = initialStatusCode;

    const req = {
      method,
      headers,
    };
    const res = {
      statusCode,
      setHeader: jest.fn((k, v) => {
        resHeaders[k.toLowerCase()] = v;
      }),
      status: jest.fn((code) => {
        statusCode = code;
      }),
    };

    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    } as any;

    return { context, req, res, resHeaders };
  }

  it('should ignore GET requests even if Idempotency-Key header is present', async () => {
    const { context } = createMockContext('GET', { 'idempotency-key': 'key-1' });
    const next: CallHandler = {
      handle: jest.fn(() => of({ data: 'ok' })),
    };

    const result$ = await interceptor.intercept(context, next);
    const result = await result$.toPromise();

    expect(next.handle).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ data: 'ok' });
  });

  it('should ignore POST requests without Idempotency-Key header', async () => {
    const { context } = createMockContext('POST', {});
    const next: CallHandler = {
      handle: jest.fn(() => of({ success: true })),
    };

    const result$ = await interceptor.intercept(context, next);
    const result = await result$.toPromise();

    expect(next.handle).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
  });

  it('should process new POST request with Idempotency-Key and store result', async () => {
    const { context, res } = createMockContext('POST', { 'idempotency-key': 'unique-uuid-1' }, 201);
    const next: CallHandler = {
      handle: jest.fn(() => of({ orderId: 'ord-123', status: 'CONFIRMED' })),
    };

    const result$ = await interceptor.intercept(context, next);
    const result = await result$.toPromise();

    expect(next.handle).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ orderId: 'ord-123', status: 'CONFIRMED' });
    expect(res.setHeader).toHaveBeenCalledWith('X-Idempotent-Key', 'unique-uuid-1');
  });

  it('should replay cached response on duplicate request with same Idempotency-Key without executing handler', async () => {
    const key = 'repeat-uuid-2';
    const firstCall = createMockContext('POST', { 'idempotency-key': key }, 201);
    const next: CallHandler = {
      handle: jest.fn(() => of({ paymentId: 'pay-456' })),
    };

    // Primeira chamada
    const first$ = await interceptor.intercept(firstCall.context, next);
    await first$.toPromise();
    expect(next.handle).toHaveBeenCalledTimes(1);

    // Segunda chamada idêntica
    const secondCall = createMockContext('POST', { 'idempotency-key': key });
    const secondNext: CallHandler = {
      handle: jest.fn(() => of({ paymentId: 'different-should-not-run' })),
    };

    const second$ = await interceptor.intercept(secondCall.context, secondNext);
    const replayResult = await second$.toPromise();

    expect(secondNext.handle).not.toHaveBeenCalled();
    expect(replayResult).toEqual({ paymentId: 'pay-456' });
    expect(secondCall.res.setHeader).toHaveBeenCalledWith('X-Idempotent-Replay', 'true');
    expect(secondCall.res.setHeader).toHaveBeenCalledWith('X-Idempotent-Key', key);
  });

  it('should clear lock if request handler fails, allowing retry with fixed data', async () => {
    const key = 'fail-key-3';
    const firstCall = createMockContext('POST', { 'idempotency-key': key });
    const failingNext: CallHandler = {
      handle: jest.fn(() => throwError(() => new HttpException('Invalid Card', HttpStatus.BAD_REQUEST))),
    };

    // Deve falhar
    const first$ = await interceptor.intercept(firstCall.context, failingNext);
    await expect(first$.toPromise()).rejects.toThrow('Invalid Card');

    // Próxima chamada com a mesma chave deve ser permitida novamente
    const secondCall = createMockContext('POST', { 'idempotency-key': key }, 200);
    const successNext: CallHandler = {
      handle: jest.fn(() => of({ success: true })),
    };

    const second$ = await interceptor.intercept(secondCall.context, successNext);
    const result = await second$.toPromise();

    expect(successNext.handle).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
  });
});
