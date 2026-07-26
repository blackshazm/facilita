import { SanitizeInterceptor } from './sanitize.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

// Mock the xss module
jest.mock('xss', () => {
  return {
    __esModule: true,
    default: (input: string) => input.replace(/<script[^>]*>.*?<\/script>/gi, '').replace(/<[^>]+>/g, ''),
  };
});

describe('SanitizeInterceptor', () => {
  let interceptor: SanitizeInterceptor;

  beforeEach(() => {
    interceptor = new SanitizeInterceptor();
  });

  function createMockContext(body?: any, query?: any, params?: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ body, query, params }),
      }),
    } as unknown as ExecutionContext;
  }

  const mockHandler: CallHandler = {
    handle: () => of({ success: true }),
  };

  it('should sanitize string values in body', (done) => {
    const body = { name: '<script>alert("xss")</script>João' };
    const context = createMockContext(body);

    interceptor.intercept(context, mockHandler).subscribe(() => {
      expect(body.name).not.toContain('<script>');
      expect(body.name).toContain('João');
      done();
    });
  });

  it('should sanitize string values in query', (done) => {
    const query = { search: '<img onerror="alert(1)">test' };
    const context = createMockContext(undefined, query);

    interceptor.intercept(context, mockHandler).subscribe(() => {
      expect(query.search).not.toContain('<img');
      expect(query.search).toContain('test');
      done();
    });
  });

  it('should sanitize string values in params', (done) => {
    const params = { id: '<b>bold</b>' };
    const context = createMockContext(undefined, undefined, params);

    interceptor.intercept(context, mockHandler).subscribe(() => {
      expect(params.id).not.toContain('<b>');
      expect(params.id).toContain('bold');
      done();
    });
  });

  it('should sanitize nested objects recursively', (done) => {
    const body = {
      user: {
        name: '<script>hack</script>Maria',
        address: {
          street: '<div>Rua A</div>',
        },
      },
    };
    const context = createMockContext(body);

    interceptor.intercept(context, mockHandler).subscribe(() => {
      expect(body.user.name).not.toContain('<script>');
      expect(body.user.address.street).not.toContain('<div>');
      done();
    });
  });

  it('should not modify non-string values', (done) => {
    const body = { count: 42, active: true, tags: ['a', 'b'] };
    const context = createMockContext(body);

    interceptor.intercept(context, mockHandler).subscribe(() => {
      expect(body.count).toBe(42);
      expect(body.active).toBe(true);
      done();
    });
  });

  it('should handle undefined body/query/params gracefully', (done) => {
    const context = createMockContext(undefined, undefined, undefined);

    interceptor.intercept(context, mockHandler).subscribe((result) => {
      expect(result).toEqual({ success: true });
      done();
    });
  });
});
