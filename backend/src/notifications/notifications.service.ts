import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
    private readonly dataSource: DataSource,
  ) {}

  async list(params: {
    unreadOnly?: boolean;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const { unreadOnly, type, page = 1, limit = 25 } = params;

    const qb = this.notifRepo.createQueryBuilder('n');
    qb.where('n.isDismissed = false');

    if (unreadOnly) {
      qb.andWhere('n.isRead = false');
    }
    if (type) {
      qb.andWhere('n.type = :type', { type });
    }

    qb.orderBy('n.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUnreadCount(): Promise<number> {
    return this.notifRepo.count({
      where: { isRead: false, isDismissed: false },
    });
  }

  async markRead(id: string): Promise<void> {
    await this.notifRepo.update(id, { isRead: true });
  }

  async markAllRead(): Promise<void> {
    await this.notifRepo.update(
      { isRead: false, isDismissed: false },
      { isRead: true },
    );
  }

  async dismiss(id: string): Promise<void> {
    await this.notifRepo.update(id, { isDismissed: true });
  }

  /**
   * Generate alerts by scanning current data.
   * Called on-demand via GET /notifications/generate.
   */
  async generateAlerts(): Promise<{ created: number }> {
    let created = 0;

    // 1. Vaccinations due within 7 days
    const vaccDue = await this.dataSource.query(`
      SELECT v.id, v."vaccineName", v."nextDueDate",
             p.name AS "patientName", p.id AS "patientId"
      FROM vaccinations v
      JOIN patients p ON p.id = v."patientId"
      WHERE v.status = 'scheduled'
        AND v."nextDueDate" IS NOT NULL
        AND v."nextDueDate" <= CURRENT_DATE + 7
        AND v."nextDueDate" >= CURRENT_DATE - 30
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n."referenceId" = v.id
            AND n.type = 'vaccination_due'
            AND n."createdAt" > CURRENT_DATE - 1
        )
    `);
    for (const v of vaccDue) {
      const isOverdue = new Date(v.nextDueDate) < new Date();
      await this.notifRepo.save(
        this.notifRepo.create({
          type: NotificationType.VACCINATION_DUE,
          priority: isOverdue ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
          title: `Vaccination ${isOverdue ? 'overdue' : 'due'}: ${v.vaccineName}`,
          message: `${v.patientName} — ${v.vaccineName} is ${isOverdue ? 'overdue since' : 'due on'} ${new Date(v.nextDueDate).toLocaleDateString()}`,
          referenceId: v.patientId,
          referenceType: 'patient',
        }),
      );
      created++;
    }

    // 2. Low stock inventory
    const lowStock = await this.dataSource.query(`
      SELECT i.id, i.name, i.sku, i."quantityOnHand", i."reorderLevel"
      FROM inventory_items i
      WHERE i."isActive" = true
        AND i."quantityOnHand" <= i."reorderLevel"
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n."referenceId" = i.id
            AND n.type = 'low_stock'
            AND n."createdAt" > CURRENT_DATE - 1
        )
    `);
    for (const item of lowStock) {
      await this.notifRepo.save(
        this.notifRepo.create({
          type: NotificationType.LOW_STOCK,
          priority: item.quantityOnHand === 0
            ? NotificationPriority.URGENT
            : NotificationPriority.HIGH,
          title: `Low stock: ${item.name}`,
          message: `${item.name} (${item.sku}) has ${item.quantityOnHand} units remaining (reorder level: ${item.reorderLevel})`,
          referenceId: item.id,
          referenceType: 'inventory',
        }),
      );
      created++;
    }

    // 3. Expiring inventory (within 30 days)
    const expiring = await this.dataSource.query(`
      SELECT i.id, i.name, i.sku, i."expirationDate"
      FROM inventory_items i
      WHERE i."isActive" = true
        AND i."expirationDate" IS NOT NULL
        AND i."expirationDate" <= CURRENT_DATE + 30
        AND i."quantityOnHand" > 0
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n."referenceId" = i.id
            AND n.type = 'expiring_inventory'
            AND n."createdAt" > CURRENT_DATE - 7
        )
    `);
    for (const item of expiring) {
      const isExpired = new Date(item.expirationDate) <= new Date();
      await this.notifRepo.save(
        this.notifRepo.create({
          type: NotificationType.EXPIRING_INVENTORY,
          priority: isExpired ? NotificationPriority.URGENT : NotificationPriority.MEDIUM,
          title: `${isExpired ? 'Expired' : 'Expiring soon'}: ${item.name}`,
          message: `${item.name} (${item.sku}) ${isExpired ? 'expired on' : 'expires on'} ${new Date(item.expirationDate).toLocaleDateString()}`,
          referenceId: item.id,
          referenceType: 'inventory',
        }),
      );
      created++;
    }

    // 4. Overdue invoices
    const overdueInv = await this.dataSource.query(`
      SELECT i.id, i."invoiceNumber", i."balanceDue", i."dueDate",
             c."firstName", c."lastName"
      FROM invoices i
      JOIN clients c ON c.id = i."clientId"
      WHERE i.status IN ('sent', 'partially_paid')
        AND i."dueDate" IS NOT NULL
        AND i."dueDate" < CURRENT_DATE
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n."referenceId" = i.id
            AND n.type = 'invoice_overdue'
            AND n."createdAt" > CURRENT_DATE - 3
        )
    `);
    for (const inv of overdueInv) {
      await this.notifRepo.save(
        this.notifRepo.create({
          type: NotificationType.INVOICE_OVERDUE,
          priority: NotificationPriority.HIGH,
          title: `Overdue invoice: ${inv.invoiceNumber}`,
          message: `Invoice ${inv.invoiceNumber} for ${inv.firstName} ${inv.lastName} — $${Number(inv.balanceDue).toFixed(2)} overdue since ${new Date(inv.dueDate).toLocaleDateString()}`,
          referenceId: inv.id,
          referenceType: 'invoice',
        }),
      );
      created++;
    }

    return { created };
  }
}
