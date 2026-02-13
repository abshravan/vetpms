import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  // UseGuards,  // TODO: re-enable auth
  UseInterceptors,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { RecordVitalsDto } from './dto/record-vitals.dto';
import { CreateClinicalNoteDto } from './dto/create-clinical-note.dto';
import { VisitStatus } from './entities/visit.entity';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';  // TODO: re-enable auth
// import { RolesGuard } from '../auth/guards/roles.guard';  // TODO: re-enable auth
// import { Roles } from '../auth/decorators/roles.decorator';  // TODO: re-enable auth
// import { CurrentUser } from '../auth/decorators/current-user.decorator';  // TODO: re-enable auth
// import { Role } from '../common/enums/role.enum';  // TODO: re-enable auth
import { AuditInterceptor } from '../audit/audit.interceptor';
import { Request } from 'express';

// DEV_USER_ID: set this to an actual user UUID from your DB for testing
const DEV_USER_ID = process.env.DEV_USER_ID || '00000000-0000-0000-0000-000000000000';

@Controller('visits')
// @UseGuards(JwtAuthGuard, RolesGuard)  // TODO: re-enable auth
@UseInterceptors(AuditInterceptor)
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  // @Roles(Role.ADMIN, Role.VET, Role.RECEPTIONIST)  // TODO: re-enable auth
  async create(@Body() dto: CreateVisitDto) {
    return this.visitsService.createVisit(dto);
  }

  @Get('patient/:patientId')
  async findByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.visitsService.findByPatient(patientId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.visitsService.findVisit(id);
  }

  @Patch(':id/status')
  // @Roles(Role.ADMIN, Role.VET)  // TODO: re-enable auth
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: VisitStatus,
  ) {
    return this.visitsService.updateVisitStatus(id, status);
  }

  @Post(':id/vitals')
  // @Roles(Role.ADMIN, Role.VET, Role.TECH)  // TODO: re-enable auth
  async recordVitals(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() dto: RecordVitalsDto,
  ) {
    const userId = (req as any).user?.id || DEV_USER_ID;
    return this.visitsService.recordVitals(id, userId, dto);
  }

  @Post(':id/notes')
  // @Roles(Role.ADMIN, Role.VET)  // TODO: re-enable auth
  async addNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() dto: CreateClinicalNoteDto,
  ) {
    const userId = (req as any).user?.id || DEV_USER_ID;
    return this.visitsService.addClinicalNote(id, userId, dto);
  }

  @Get(':id/notes')
  async getNotes(@Param('id', ParseUUIDPipe) id: string) {
    return this.visitsService.getVisitNotes(id);
  }

  @Patch(':id/complete')
  // @Roles(Role.ADMIN, Role.VET)  // TODO: re-enable auth
  async complete(@Param('id', ParseUUIDPipe) id: string) {
    return this.visitsService.completeVisit(id);
  }
}
