import { Controller, Get, Query } from '@nestjs/common';
// TODO: re-enable auth
// import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';
import { AuditService } from './audit.service';

@Controller('audit')
// @UseGuards(JwtAuthGuard, RolesGuard) // TODO: re-enable auth
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  // @Roles('admin') // TODO: re-enable auth
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('resource') resource?: string,
    @Query('action') action?: string,
  ) {
    return this.auditService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      resource,
      action,
    });
  }
}
