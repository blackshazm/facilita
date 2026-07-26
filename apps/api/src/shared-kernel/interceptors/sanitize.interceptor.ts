import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import xss from 'xss'; // Assuming xss is or will be installed

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.body && typeof request.body === 'object') {
      this.sanitizeObject(request.body);
    }
    if (request.query && typeof request.query === 'object') {
      this.sanitizeObject(request.query);
    }
    if (request.params && typeof request.params === 'object') {
      this.sanitizeObject(request.params);
    }

    return next.handle();
  }

  private sanitizeObject(obj: any) {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.sanitizeObject(obj[key]);
      }
    }
  }
}
