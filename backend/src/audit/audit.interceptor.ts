import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';
import { Request } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    // Only audit state-changing operations
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return next.handle();
    }

    const user = request.user as { id?: string; email?: string } | undefined;
    const resource = context.getClass().name.replace('Controller', '');
    const action = `${method} ${request.path}`;
    const ipAddress = request.ip || null;

    return next.handle().pipe(
      tap((responseBody) => {
        const resourceId =
          request.params.id ||
          (typeof responseBody === 'object' && responseBody !== null && 'id' in responseBody
            ? (responseBody as Record<string, unknown>).id
            : undefined);

        this.auditService
          .log({
            action,
            resource,
            resourceId: resourceId as string | undefined,
            userId: user?.id,
            userEmail: user?.email,
            details: { body: this.sanitizeBody(request.body) },
            ipAddress: ipAddress || undefined,
          })
          .catch(() => {
            // Audit logging should never break the request
          });
      }),
    );
  }

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body) return {};
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'passwordHash', 'refreshToken', 'refreshTokenHash'];
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    return sanitized;
  }
}
