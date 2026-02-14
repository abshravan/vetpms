import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Invoice, InvoiceItem, InvoiceStatus } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto, RecordPaymentDto } from './dto/update-invoice.dto';
import { PaginationQueryDto, PaginatedResult } from '../common/dto/pagination-query.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly itemRepo: Repository<InvoiceItem>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    return this.dataSource.transaction(async (manager) => {
      // Generate invoice number
      const result = await manager.query(`SELECT nextval('invoice_number_seq') as num`);
      const invoiceNumber = `INV-${String(result[0].num).padStart(5, '0')}`;

      // Calculate line totals and subtotal
      const items = dto.items.map((item) => {
        const quantity = item.quantity ?? 1;
        const lineTotal = Number((quantity * item.unitPrice).toFixed(2));
        return { ...item, quantity, lineTotal };
      });

      const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
      const taxRate = dto.taxRate ?? 0;
      const taxAmount = Number((subtotal * taxRate / 100).toFixed(2));
      const discountAmount = dto.discountAmount ?? 0;
      const totalAmount = Number((subtotal + taxAmount - discountAmount).toFixed(2));

      const invoice = manager.create(Invoice, {
        invoiceNumber,
        clientId: dto.clientId,
        patientId: dto.patientId || null,
        visitId: dto.visitId || null,
        issueDate: dto.issueDate || new Date().toISOString().split('T')[0],
        dueDate: dto.dueDate || null,
        subtotal,
        taxRate,
        taxAmount,
        discountAmount,
        totalAmount,
        amountPaid: 0,
        balanceDue: totalAmount,
        notes: dto.notes || null,
      });

      const saved = await manager.save(Invoice, invoice);

      // Save items
      const invoiceItems = items.map((item) =>
        manager.create(InvoiceItem, {
          ...item,
          invoiceId: saved.id,
        }),
      );
      await manager.save(InvoiceItem, invoiceItems);

      return this.findOne(saved.id);
    });
  }

  async findAll(
    query: PaginationQueryDto & { clientId?: string; status?: InvoiceStatus },
  ): Promise<PaginatedResult<Invoice>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.invoiceRepo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.client', 'client')
      .leftJoinAndSelect('invoice.patient', 'patient')
      .leftJoinAndSelect('invoice.items', 'items')
      .orderBy('invoice.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.clientId) {
      qb.andWhere('invoice.clientId = :clientId', { clientId: query.clientId });
    }

    if (query.status) {
      qb.andWhere('invoice.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(invoice.invoiceNumber ILIKE :search OR client.lastName ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['client', 'patient', 'visit', 'items'],
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async findByClient(clientId: string): Promise<Invoice[]> {
    return this.invoiceRepo.find({
      where: { clientId },
      relations: ['patient', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPatient(patientId: string): Promise<Invoice[]> {
    return this.invoiceRepo.find({
      where: { patientId },
      relations: ['client', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.REFUNDED) {
      throw new BadRequestException('Cannot modify a paid or refunded invoice');
    }

    if (dto.taxRate !== undefined || dto.discountAmount !== undefined) {
      const taxRate = dto.taxRate ?? Number(invoice.taxRate);
      const discountAmount = dto.discountAmount ?? Number(invoice.discountAmount);
      const subtotal = Number(invoice.subtotal);
      const taxAmount = Number((subtotal * taxRate / 100).toFixed(2));
      const totalAmount = Number((subtotal + taxAmount - discountAmount).toFixed(2));

      invoice.taxRate = taxRate;
      invoice.taxAmount = taxAmount;
      invoice.discountAmount = discountAmount;
      invoice.totalAmount = totalAmount;
      invoice.balanceDue = Number((totalAmount - Number(invoice.amountPaid)).toFixed(2));
    }

    if (dto.status) invoice.status = dto.status;
    if (dto.dueDate !== undefined) invoice.dueDate = dto.dueDate as any;
    if (dto.notes !== undefined) invoice.notes = dto.notes;

    await this.invoiceRepo.save(invoice);
    return this.findOne(id);
  }

  async recordPayment(id: string, dto: RecordPaymentDto): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.CANCELLED || invoice.status === InvoiceStatus.REFUNDED) {
      throw new BadRequestException('Cannot record payment for a cancelled or refunded invoice');
    }

    const newAmountPaid = Number((Number(invoice.amountPaid) + dto.amount).toFixed(2));
    const totalAmount = Number(invoice.totalAmount);
    const newBalance = Number((totalAmount - newAmountPaid).toFixed(2));

    invoice.amountPaid = newAmountPaid;
    invoice.balanceDue = Math.max(0, newBalance);
    invoice.paymentMethod = dto.paymentMethod;
    invoice.paymentDate = (dto.paymentDate || new Date().toISOString().split('T')[0]) as any;

    if (newBalance <= 0) {
      invoice.status = InvoiceStatus.PAID;
    } else {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    if (dto.notes) {
      invoice.notes = invoice.notes
        ? `${invoice.notes}\nPayment: ${dto.notes}`
        : `Payment: ${dto.notes}`;
    }

    await this.invoiceRepo.save(invoice);
    return this.findOne(id);
  }

  async addItem(invoiceId: string, item: { description: string; category?: string; quantity?: number; unitPrice: number; notes?: string }): Promise<Invoice> {
    const invoice = await this.findOne(invoiceId);

    if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot add items to a paid or cancelled invoice');
    }

    const quantity = item.quantity ?? 1;
    const lineTotal = Number((quantity * item.unitPrice).toFixed(2));

    const invoiceItem = this.itemRepo.create({
      invoiceId,
      description: item.description,
      category: item.category || null,
      quantity,
      unitPrice: item.unitPrice,
      lineTotal,
      notes: item.notes || null,
    });
    await this.itemRepo.save(invoiceItem);

    // Recalculate totals
    return this.recalculateTotals(invoiceId);
  }

  async removeItem(invoiceId: string, itemId: string): Promise<Invoice> {
    const invoice = await this.findOne(invoiceId);

    if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot remove items from a paid or cancelled invoice');
    }

    await this.itemRepo.delete({ id: itemId, invoiceId });
    return this.recalculateTotals(invoiceId);
  }

  private async recalculateTotals(invoiceId: string): Promise<Invoice> {
    const invoice = await this.findOne(invoiceId);
    const subtotal = invoice.items.reduce((sum, i) => sum + Number(i.lineTotal), 0);
    const taxAmount = Number((subtotal * Number(invoice.taxRate) / 100).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount - Number(invoice.discountAmount)).toFixed(2));

    invoice.subtotal = subtotal;
    invoice.taxAmount = taxAmount;
    invoice.totalAmount = totalAmount;
    invoice.balanceDue = Number((totalAmount - Number(invoice.amountPaid)).toFixed(2));

    await this.invoiceRepo.save(invoice);
    return this.findOne(invoiceId);
  }
}
