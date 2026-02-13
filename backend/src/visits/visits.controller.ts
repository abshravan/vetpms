import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { RecordVitalsDto } from './dto/record-vitals.dto';
import { CreateClinicalNoteDto } from './dto/create-clinical-note.dto';
import { VisitStatus } from './entities/visit.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { AuditInterceptor } from '../audit/audit.interceptor';

@Controller('visits')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.VET, Role.RECEPTIONIST)
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
  @Roles(Role.ADMIN, Role.VET)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: VisitStatus,
  ) {
    return this.visitsService.updateVisitStatus(id, status);
  }

  @Post(':id/vitals')
  @Roles(Role.ADMIN, Role.VET, Role.TECH)
  async recordVitals(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: RecordVitalsDto,
  ) {
    return this.visitsService.recordVitals(id, user.id, dto);
  }

  @Post(':id/notes')
  @Roles(Role.ADMIN, Role.VET)
  async addNote(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateClinicalNoteDto,
  ) {
    return this.visitsService.addClinicalNote(id, user.id, dto);
  }

  @Get(':id/notes')
  async getNotes(@Param('id', ParseUUIDPipe) id: string) {
    return this.visitsService.getVisitNotes(id);
  }

  @Patch(':id/complete')
  @Roles(Role.ADMIN, Role.VET)
  async complete(@Param('id', ParseUUIDPipe) id: string) {
    return this.visitsService.completeVisit(id);
  }
}
