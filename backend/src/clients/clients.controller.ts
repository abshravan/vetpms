import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { AuditInterceptor } from '../audit/audit.interceptor';

@Controller('clients')
// @UseGuards(JwtAuthGuard, RolesGuard)  // TODO: re-enable auth
@UseInterceptors(AuditInterceptor)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  // @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.VET)  // TODO: re-enable auth
  async create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    return this.clientsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  // @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.VET)  // TODO: re-enable auth
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  // @Roles(Role.ADMIN)  // TODO: re-enable auth
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.deactivate(id);
  }
}
