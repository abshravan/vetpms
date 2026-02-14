import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto, CreateInvoiceItemDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto, RecordPaymentDto } from './dto/update-invoice.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { InvoiceStatus } from './entities/invoice.entity';
import { AuditInterceptor } from '../audit/audit.interceptor';

@Controller()
// @UseGuards(JwtAuthGuard, RolesGuard)  // TODO: re-enable auth
@UseInterceptors(AuditInterceptor)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('invoices')
  async create(@Body() dto: CreateInvoiceDto) {
    return this.billingService.create(dto);
  }

  @Get('invoices')
  async findAll(
    @Query() query: PaginationQueryDto,
    @Query('clientId') clientId?: string,
    @Query('status') status?: InvoiceStatus,
  ) {
    return this.billingService.findAll({ ...query, clientId, status });
  }

  @Get('invoices/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.billingService.findOne(id);
  }

  @Get('clients/:clientId/invoices')
  async findByClient(@Param('clientId', ParseUUIDPipe) clientId: string) {
    return this.billingService.findByClient(clientId);
  }

  @Get('patients/:patientId/invoices')
  async findByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.billingService.findByPatient(patientId);
  }

  @Patch('invoices/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.billingService.update(id, dto);
  }

  @Post('invoices/:id/payment')
  async recordPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.billingService.recordPayment(id, dto);
  }

  @Post('invoices/:id/items')
  async addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateInvoiceItemDto,
  ) {
    return this.billingService.addItem(id, dto);
  }

  @Delete('invoices/:invoiceId/items/:itemId')
  async removeItem(
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.billingService.removeItem(invoiceId, itemId);
  }
}
