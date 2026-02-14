import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { InventoryItem } from './inventory-item.entity';

export enum TransactionType {
  PURCHASE = 'purchase',
  DISPENSED = 'dispensed',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
  EXPIRED = 'expired',
  DAMAGED = 'damaged',
  TRANSFER = 'transfer',
}

@Entity('inventory_transactions')
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  itemId: string;

  @ManyToOne(() => InventoryItem, (item) => item.transactions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'itemId' })
  item: InventoryItem;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int', comment: 'Stock level after this transaction' })
  quantityAfter: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost: number | null;

  @Column({ type: 'uuid', nullable: true, comment: 'Patient this was dispensed to' })
  patientId: string | null;

  @Column({ type: 'uuid', nullable: true, comment: 'Visit during which item was dispensed' })
  visitId: string | null;

  @Column({ type: 'uuid', nullable: true, comment: 'User who recorded this' })
  performedById: string | null;

  @Column({ length: 100, nullable: true })
  reference: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
