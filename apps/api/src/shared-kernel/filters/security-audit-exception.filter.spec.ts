import { SecurityAuditExceptionFilter } from './security-audit-exception.filter';
import { UnauthorizedException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';

describe('SecurityAuditExceptionFilter', () => {
  let filter: SecurityAuditExceptionFilter;
  let mockPrisma: any;
  let mockArgumentsHost: any;
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(() => {
    mockPrisma = {
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/orders/secret-123',
      method: 'GET',
      ip: '192.168.1.100',
      headers: { 'user-agent': 'JestTestRunner' },
      user: { id: 'attacker-1' },
    };

    mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };

    filter = new SecurityAuditExceptionFilter(mockPrisma);
  });

  it('should intercept 401 Unauthorized and log to AuditLog', async () => {
    const exception = new UnauthorizedException('Token expirado ou inválido');

    await filter.catch(exception, mockArgumentsHost);

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        adminId: 'SYSTEM_SECURITY',
        targetId: 'attacker-1',
        action: 'SECURITY_VIOLATION',
        reason: 'Token expirado ou inválido',
        metadata: expect.objectContaining({
          statusCode: 401,
          path: '/orders/secret-123',
          method: 'GET',
          ip: '192.168.1.100',
        }),
      }),
    });

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should intercept 403 Forbidden and log to AuditLog with ANONYMOUS if no user', async () => {
    mockRequest.user = null;
    const exception = new ForbiddenException('Acesso negado');

    await filter.catch(exception, mockArgumentsHost);

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        adminId: 'SYSTEM_SECURITY',
        targetId: 'ANONYMOUS',
        action: 'SECURITY_VIOLATION',
        reason: 'Acesso negado',
      }),
    });

    expect(mockResponse.status).toHaveBeenCalledWith(403);
  });

  it('should not write to AuditLog for standard non-security errors like 404 or 400', async () => {
    const exception = new HttpException('Item não encontrado', HttpStatus.NOT_FOUND);

    await filter.catch(exception, mockArgumentsHost);

    expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(404);
  });
});
