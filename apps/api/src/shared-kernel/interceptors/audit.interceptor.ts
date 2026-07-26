import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, ip, user } = req;
    const userAgent = req.get('user-agent') || '';
    
    const userId = user ? user.userId : 'anonymous';

    return next.handle().pipe(
      tap(() => {
        if (method !== 'GET') {
          this.logger.log(`Audit Log: [${method}] ${url} - User: ${userId} - IP: ${ip} - UA: ${userAgent}`);
        }
      }),
    );
  }
}
