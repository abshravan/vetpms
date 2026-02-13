import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

export enum Species {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  RABBIT = 'rabbit',
  REPTILE = 'reptile',
  HORSE = 'horse',
  OTHER = 'other',
}

export enum Sex {
  MALE = 'male',
  FEMALE = 'female',
  MALE_NEUTERED = 'male_neutered',
  FEMALE_SPAYED = 'female_spayed',
  UNKNOWN = 'unknown',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  clientId: string;

  @ManyToOne(() => Client, (client) => client.patients, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: Species })
  species: Species;

  @Column({ length: 100, nullable: true })
  breed: string | null;

  @Column({ length: 50, nullable: true })
  color: string | null;

  @Column({ type: 'enum', enum: Sex, default: Sex.UNKNOWN })
  sex: Sex;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  weight: number | null;

  @Column({ length: 10, nullable: true, comment: 'kg or lb' })
  weightUnit: string | null;

  @Column({ length: 50, nullable: true })
  microchipNumber: string | null;

  @Column({ length: 50, nullable: true })
  insuranceProvider: string | null;

  @Column({ length: 50, nullable: true })
  insurancePolicyNumber: string | null;

  @Column({ type: 'text', nullable: true })
  allergies: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ nullable: true })
  photoUrl: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDeceased: boolean;

  @Column({ type: 'date', nullable: true })
  deceasedDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
