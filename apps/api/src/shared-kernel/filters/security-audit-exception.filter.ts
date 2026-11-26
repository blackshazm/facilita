import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../database/prisma.service';

/**
 * Filtro Global de Auditoria de Segurança
 * Resolução v4.1 (#51): Captura violações 401 (Unauthorized), 403 (Forbidden) e 429 (Rate Limit Exceeded)
 * registrando tentativas anômalas ou de força bruta no AuditLog.
 */
@Catch(HttpException)
@Injectable()
export class SecurityAuditExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SecurityAuditExceptionFilter.name);
  private readonly securityStatusCodes = new Set([
    HttpStatus.UNAUTHORIZED, // 401
    HttpStatus.FORBIDDEN, // 403
    HttpStatus.TOO_MANY_REQUESTS, // 429
  ]);

  constructor(private readonly prisma: PrismaService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { user?: any }>();
    const status = exception.getStatus();

    if (this.securityStatusCodes.has(status)) {
      const userId = request.user?.id || request.user?.userId || 'ANONYMOUS';
      const ip = request.ip || (request.socket ? request.socket.remoteAddress : 'unknown') || 'unknown';
      const userAgent = request.headers['user-agent'] || 'unknown';
      const path = request.url;
      const method = request.method;
      const reason = exception.message || 'Security Violation';

      this.logger.warn(
        `[Security Audit] Status ${status} - ${method} ${path} - User: ${userId} - IP: ${ip} - Motivo: ${reason}`,
      );

      try {
        if (this.prisma && this.prisma.auditLog) {
          await this.prisma.auditLog.create({
            data: {
              adminId: 'SYSTEM_SECURITY',
              targetId: userId,
              action: 'SECURITY_VIOLATION',
              reason,
              metadata: {
                statusCode: status,
                ip,
                path,
                method,
                userAgent,
              },
            },
          });
        }
      } catch (err: any) {
        this.logger.error(`Falha ao registrar AuditLog de segurança: ${err.message}`);
      }
    }

    const exceptionResponse = exception.getResponse();
    const payload =
      typeof exceptionResponse === 'object'
        ? exceptionResponse
        : { statusCode: status, message: exceptionResponse };

    response.status(status).json(payload);
  }
}
