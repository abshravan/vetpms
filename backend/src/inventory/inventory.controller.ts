import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
// TODO: re-enable auth
// import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Request } from 'express';

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

@Controller()
// @UseGuards(JwtAuthGuard, RolesGuard) // TODO: re-enable auth
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ── Items ──

  @Post('inventory')
  // @Roles('admin', 'veterinarian', 'technician') // TODO: re-enable auth
  create(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.create(dto);
  }

  @Get('inventory')
  list(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('lowStock') lowStock?: string,
    @Query('active') active?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.list({
      search,
      category,
      lowStock: lowStock === 'true',
      active: active !== 'false',
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('inventory/low-stock')
  getLowStock() {
    return this.inventoryService.getLowStockItems();
  }

  @Get('inventory/expiring')
  getExpiring(@Query('days') days?: string) {
    return this.inventoryService.getExpiringItems(
      days ? parseInt(days, 10) : undefined,
    );
  }

  @Get('inventory/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch('inventory/:id')
  // @Roles('admin', 'veterinarian', 'technician') // TODO: re-enable auth
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInventoryItemDto,
  ) {
    return this.inventoryService.update(id, dto);
  }

  @Delete('inventory/:id')
  // @Roles('admin') // TODO: re-enable auth
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.remove(id);
  }

  // ── Transactions ──

  @Post('inventory/transactions')
  // @Roles('admin', 'veterinarian', 'technician') // TODO: re-enable auth
  recordTransaction(@Body() dto: CreateTransactionDto, @Req() req: Request) {
    const userId = (req as any).user?.id || DEV_USER_ID;
    return this.inventoryService.recordTransaction(dto, userId);
  }

  @Get('inventory/:id/transactions')
  getTransactions(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.getTransactions(id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('inventory/:id/dispense')
  // @Roles('admin', 'veterinarian', 'technician') // TODO: re-enable auth
  dispense(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { quantity: number; patientId: string; visitId?: string; notes?: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id || DEV_USER_ID;
    return this.inventoryService.dispense(
      id,
      body.quantity,
      body.patientId,
      body.visitId,
      userId,
      body.notes,
    );
  }

  @Post('inventory/:id/restock')
  // @Roles('admin') // TODO: re-enable auth
  restock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { quantity: number; unitCost?: number; reference?: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id || DEV_USER_ID;
    return this.inventoryService.restock(
      id,
      body.quantity,
      body.unitCost,
      body.reference,
      userId,
    );
  }
}
