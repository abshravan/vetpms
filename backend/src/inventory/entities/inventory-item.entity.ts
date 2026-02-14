import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { InventoryTransaction } from './inventory-transaction.entity';

export enum ItemCategory {
  MEDICATION = 'medication',
  VACCINE = 'vaccine',
  SURGICAL_SUPPLY = 'surgical_supply',
  LAB_SUPPLY = 'lab_supply',
  FOOD = 'food',
  SUPPLEMENT = 'supplement',
  EQUIPMENT = 'equipment',
  CONSUMABLE = 'consumable',
  OTHER = 'other',
}

export enum ItemUnit {
  TABLET = 'tablet',
  CAPSULE = 'capsule',
  ML = 'ml',
  MG = 'mg',
  G = 'g',
  DOSE = 'dose',
  VIAL = 'vial',
  BOTTLE = 'bottle',
  BOX = 'box',
  PACK = 'pack',
  UNIT = 'unit',
  OTHER = 'other',
}

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 50, unique: true })
  sku: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ItemCategory,
    default: ItemCategory.MEDICATION,
  })
  category: ItemCategory;

  @Column({
    type: 'enum',
    enum: ItemUnit,
    default: ItemUnit.UNIT,
  })
  unit: ItemUnit;

  @Column({ length: 100, nullable: true })
  manufacturer: string | null;

  @Column({ length: 100, nullable: true })
  supplier: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sellingPrice: number;

  @Column({ type: 'int', default: 0 })
  quantityOnHand: number;

  @Column({ type: 'int', default: 10 })
  reorderLevel: number;

  @Column({ type: 'int', default: 50 })
  reorderQuantity: number;

  @Column({ length: 100, nullable: true, comment: 'Batch or lot number' })
  lotNumber: string | null;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date | null;

  @Column({ length: 100, nullable: true, comment: 'Shelf/bin location' })
  location: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  requiresPrescription: boolean;

  @Column({ default: false })
  isControlledSubstance: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => InventoryTransaction, (t) => t.item)
  transactions: InventoryTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
