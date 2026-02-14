import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('clinic_settings')
export class ClinicSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200, default: 'Veterinary Clinic' })
  clinicName: string;

  @Column({ length: 20, nullable: true })
  phone: string | null;

  @Column({ length: 255, nullable: true })
  email: string | null;

  @Column({ length: 255, nullable: true })
  website: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ length: 100, nullable: true })
  city: string | null;

  @Column({ length: 50, nullable: true })
  state: string | null;

  @Column({ length: 20, nullable: true })
  zipCode: string | null;

  @Column({ length: 100, nullable: true })
  country: string | null;

  @Column({ length: 50, nullable: true })
  timezone: string | null;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  defaultTaxRate: number;

  @Column({ type: 'int', default: 30, comment: 'Default appointment slot in minutes' })
  appointmentSlotMinutes: number;

  @Column({ length: 5, default: '08:00', comment: 'HH:mm format' })
  businessHoursStart: string;

  @Column({ length: 5, default: '18:00', comment: 'HH:mm format' })
  businessHoursEnd: string;

  @Column({ type: 'text', nullable: true, comment: 'JSON array of closed days, e.g. ["Sunday"]' })
  closedDays: string | null;

  @Column({ type: 'int', default: 30, comment: 'Invoice payment terms in days' })
  invoicePaymentTermsDays: number;

  @Column({ type: 'text', nullable: true, comment: 'Footer text on invoices' })
  invoiceFooter: string | null;

  @Column({ type: 'text', nullable: true })
  logoUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
