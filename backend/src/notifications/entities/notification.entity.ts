import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum NotificationType {
  VACCINATION_DUE = 'vaccination_due',
  PREVENTIVE_CARE_OVERDUE = 'preventive_care_overdue',
  LOW_STOCK = 'low_stock',
  EXPIRING_INVENTORY = 'expiring_inventory',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  INVOICE_OVERDUE = 'invoice_overdue',
  SYSTEM = 'system',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority: NotificationPriority;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'uuid', nullable: true, comment: 'Related entity ID' })
  referenceId: string | null;

  @Column({ length: 50, nullable: true, comment: 'e.g. patient, invoice, inventory' })
  referenceType: string | null;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isDismissed: boolean;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
