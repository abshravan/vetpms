import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  // UseGuards,  // TODO: re-enable auth
  UseInterceptors,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { UpdateVaccinationDto } from './dto/update-vaccination.dto';
import { CreatePreventiveCareDto } from './dto/create-preventive-care.dto';
import { UpdatePreventiveCareDto } from './dto/update-preventive-care.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';  // TODO: re-enable auth
// import { RolesGuard } from '../auth/guards/roles.guard';  // TODO: re-enable auth
// import { Roles } from '../auth/decorators/roles.decorator';  // TODO: re-enable auth
// import { CurrentUser } from '../auth/decorators/current-user.decorator';  // TODO: re-enable auth
// import { Role } from '../common/enums/role.enum';  // TODO: re-enable auth
import { AuditInterceptor } from '../audit/audit.interceptor';
import { Request } from 'express';

// DEV_USER_ID: set this to an actual user UUID from your DB for testing
const DEV_USER_ID = process.env.DEV_USER_ID || '00000000-0000-0000-0000-000000000000';

@Controller()
// @UseGuards(JwtAuthGuard, RolesGuard)  // TODO: re-enable auth
@UseInterceptors(AuditInterceptor)
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  // ── Treatments ──

  @Post('treatments')
  // @Roles(Role.ADMIN, Role.VET, Role.TECH)  // TODO: re-enable auth
  async createTreatment(
    @Req() req: Request,
    @Body() dto: CreateTreatmentDto,
  ) {
    const userId = (req as any).user?.id || DEV_USER_ID;
    return this.treatmentsService.createTreatment(userId, dto);
  }

  @Get('treatments/:id')
  async getTreatment(@Param('id', ParseUUIDPipe) id: string) {
    return this.treatmentsService.findTreatment(id);
  }

  @Get('visits/:visitId/treatments')
  async getTreatmentsByVisit(@Param('visitId', ParseUUIDPipe) visitId: string) {
    return this.treatmentsService.findTreatmentsByVisit(visitId);
  }

  @Get('patients/:patientId/treatments')
  async getTreatmentsByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.treatmentsService.findTreatmentsByPatient(patientId);
  }

  @Patch('treatments/:id')
  // @Roles(Role.ADMIN, Role.VET, Role.TECH)  // TODO: re-enable auth
  async updateTreatment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTreatmentDto,
  ) {
    return this.treatmentsService.updateTreatment(id, dto);
  }

  // ── Vaccinations ──

  @Post('vaccinations')
  // @Roles(Role.ADMIN, Role.VET, Role.TECH)  // TODO: re-enable auth
  async createVaccination(
    @Req() req: Request,
    @Body() dto: CreateVaccinationDto,
  ) {
    const userId = (req as any).user?.id || DEV_USER_ID;
    return this.treatmentsService.createVaccination(userId, dto);
  }

  @Get('vaccinations/:id')
  async getVaccination(@Param('id', ParseUUIDPipe) id: string) {
    return this.treatmentsService.findVaccination(id);
  }

  @Get('patients/:patientId/vaccinations')
  async getVaccinationsByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.treatmentsService.findVaccinationsByPatient(patientId);
  }

  @Patch('vaccinations/:id')
  // @Roles(Role.ADMIN, Role.VET, Role.TECH)  // TODO: re-enable auth
  async updateVaccination(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() dto: UpdateVaccinationDto,
  ) {
    const userId = (req as any).user?.id || DEV_USER_ID;
    return this.treatmentsService.updateVaccination(id, userId, dto);
  }

  @Get('vaccinations/upcoming')
  async getUpcomingVaccinations(@Query('days') days?: string) {
    const daysAhead = days ? parseInt(days, 10) : 30;
    return this.treatmentsService.getUpcomingVaccinations(daysAhead);
  }

  // ── Preventive Care ──

  @Post('preventive-care')
  // @Roles(Role.ADMIN, Role.VET, Role.TECH)  // TODO: re-enable auth
  async createPreventiveCare(@Body() dto: CreatePreventiveCareDto) {
    return this.treatmentsService.createPreventiveCare(dto);
  }

  @Get('preventive-care/:id')
  async getPreventiveCare(@Param('id', ParseUUIDPipe) id: string) {
    return this.treatmentsService.findPreventiveCare(id);
  }

  @Get('patients/:patientId/preventive-care')
  async getPreventiveCareByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.treatmentsService.findPreventiveCareByPatient(patientId);
  }

  @Patch('preventive-care/:id')
  // @Roles(Role.ADMIN, Role.VET, Role.TECH)  // TODO: re-enable auth
  async updatePreventiveCare(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePreventiveCareDto,
  ) {
    return this.treatmentsService.updatePreventiveCare(id, dto);
  }

  @Get('preventive-care-overdue')
  async getOverduePreventiveCare() {
    return this.treatmentsService.getOverduePreventiveCare();
  }
}
