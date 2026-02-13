import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async log(entry: {
    action: string;
    resource: string;
    resourceId?: string;
    userId?: string;
    userEmail?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<void> {
    const auditLog = this.auditRepository.create(entry);
    await this.auditRepository.save(auditLog);
  }

  async findByResource(resource: string, resourceId: string): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { resource, resourceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string, limit = 50): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
