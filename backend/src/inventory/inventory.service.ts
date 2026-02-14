import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import {
  InventoryTransaction,
  TransactionType,
} from './entities/inventory-transaction.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly itemRepo: Repository<InventoryItem>,
    @InjectRepository(InventoryTransaction)
    private readonly txnRepo: Repository<InventoryTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  // ── Inventory Items ──

  async create(dto: CreateInventoryItemDto): Promise<InventoryItem> {
    const existing = await this.itemRepo.findOne({ where: { sku: dto.sku } });
    if (existing) {
      throw new BadRequestException(`SKU "${dto.sku}" already exists`);
    }
    const item = this.itemRepo.create(dto);
    return this.itemRepo.save(item);
  }

  async list(params: {
    search?: string;
    category?: string;
    lowStock?: boolean;
    active?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      category,
      lowStock,
      active = true,
      page = 1,
      limit = 25,
    } = params;

    const qb = this.itemRepo.createQueryBuilder('item');
    qb.where('item.isActive = :active', { active });

    if (search) {
      qb.andWhere(
        '(item.name ILIKE :search OR item.sku ILIKE :search OR item.manufacturer ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      qb.andWhere('item.category = :category', { category });
    }

    if (lowStock) {
      qb.andWhere('item.quantityOnHand <= item.reorderLevel');
    }

    qb.orderBy('item.name', 'ASC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<InventoryItem> {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');
    return item;
  }

  async update(
    id: string,
    dto: UpdateInventoryItemDto,
  ): Promise<InventoryItem> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    item.isActive = false;
    await this.itemRepo.save(item);
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return this.itemRepo
      .createQueryBuilder('item')
      .where('item.isActive = true')
      .andWhere('item.quantityOnHand <= item.reorderLevel')
      .orderBy('item.quantityOnHand', 'ASC')
      .getMany();
  }

  async getExpiringItems(daysAhead = 30): Promise<InventoryItem[]> {
    return this.itemRepo
      .createQueryBuilder('item')
      .where('item.isActive = true')
      .andWhere('item.expirationDate IS NOT NULL')
      .andWhere('item.expirationDate <= CURRENT_DATE + :days', { days: daysAhead })
      .andWhere('item.quantityOnHand > 0')
      .orderBy('item.expirationDate', 'ASC')
      .getMany();
  }

  // ── Transactions (Stock Movements) ──

  async recordTransaction(
    dto: CreateTransactionDto,
    performedById?: string,
  ): Promise<InventoryTransaction> {
    return this.dataSource.transaction(async (manager) => {
      const item = await manager.findOne(InventoryItem, {
        where: { id: dto.itemId },
      });
      if (!item) throw new NotFoundException('Inventory item not found');

      // Calculate new stock level
      const inbound = [
        TransactionType.PURCHASE,
        TransactionType.RETURN,
      ];
      const outbound = [
        TransactionType.DISPENSED,
        TransactionType.EXPIRED,
        TransactionType.DAMAGED,
      ];

      let newQty = item.quantityOnHand;
      if (inbound.includes(dto.type)) {
        newQty += Math.abs(dto.quantity);
      } else if (outbound.includes(dto.type)) {
        newQty -= Math.abs(dto.quantity);
        if (newQty < 0) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${item.quantityOnHand}, Requested: ${Math.abs(dto.quantity)}`,
          );
        }
      } else {
        // adjustment / transfer — quantity can be positive or negative
        newQty += dto.quantity;
        if (newQty < 0) {
          throw new BadRequestException(
            `Adjustment would result in negative stock (${newQty})`,
          );
        }
      }

      // Update item stock
      item.quantityOnHand = newQty;
      await manager.save(InventoryItem, item);

      // Create transaction record
      const txn = manager.create(InventoryTransaction, {
        itemId: dto.itemId,
        type: dto.type,
        quantity: dto.quantity,
        quantityAfter: newQty,
        unitCost: dto.unitCost,
        patientId: dto.patientId,
        visitId: dto.visitId,
        performedById: performedById || null,
        reference: dto.reference,
        notes: dto.notes,
      });
      return manager.save(InventoryTransaction, txn);
    });
  }

  async getTransactions(
    itemId: string,
    params: { page?: number; limit?: number } = {},
  ) {
    const { page = 1, limit = 25 } = params;
    const [data, total] = await this.txnRepo.findAndCount({
      where: { itemId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async dispense(
    itemId: string,
    quantity: number,
    patientId: string,
    visitId?: string,
    performedById?: string,
    notes?: string,
  ): Promise<InventoryTransaction> {
    return this.recordTransaction(
      {
        itemId,
        type: TransactionType.DISPENSED,
        quantity,
        patientId,
        visitId,
        notes,
      },
      performedById,
    );
  }

  async restock(
    itemId: string,
    quantity: number,
    unitCost?: number,
    reference?: string,
    performedById?: string,
  ): Promise<InventoryTransaction> {
    return this.recordTransaction(
      {
        itemId,
        type: TransactionType.PURCHASE,
        quantity,
        unitCost,
        reference,
      },
      performedById,
    );
  }
}
