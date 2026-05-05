import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FinancialAuditService } from '../services/financial-audit.service';

@Injectable()
export class FinancialAuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: FinancialAuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      tap(async (data) => {
        // Only log if the response indicates an auditable action
        // Use cases can return an audit metadata object
        if (data?.auditAction) {
          await this.auditService.log({
            actorId: user?.id || 'SYSTEM',
            actorType: user?.role === 'ADMIN' ? 'ADMIN' : 'SYSTEM',
            action: data.auditAction,
            entityType: data.entityType,
            entityId: data.entityId,
            before: data.before,
            after: data.after,
            metadata: {
              ip: request.ip,
              path: request.url,
              ...data.metadata,
            },
          });
        }
      }),
    );
  }
}
