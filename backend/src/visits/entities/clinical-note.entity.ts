import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Visit } from './visit.entity';
import { User } from '../../users/entities/user.entity';

export enum NoteType {
  SOAP = 'soap',
  PROGRESS = 'progress',
  PROCEDURE = 'procedure',
  DISCHARGE = 'discharge',
  GENERAL = 'general',
}

/**
 * Clinical notes are APPEND-ONLY.
 * No UPDATE or DELETE is allowed on this entity.
 * Corrections are added as new notes referencing the original.
 *
 * SOAP format stored as JSONB:
 * {
 *   subjective: string,   // owner's description, history
 *   objective: string,    // physical exam findings, test results
 *   assessment: string,   // diagnosis / differential diagnosis
 *   plan: string          // treatment plan, follow-up
 * }
 */
@Entity('clinical_notes')
export class ClinicalNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  visitId: string;

  @ManyToOne(() => Visit, (v) => v.clinicalNotes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'visitId' })
  visit: Visit;

  @Column({ type: 'uuid' })
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ type: 'enum', enum: NoteType, default: NoteType.SOAP })
  noteType: NoteType;

  @Column({ type: 'jsonb' })
  content: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    text?: string;
  };

  @Column({ type: 'uuid', nullable: true, comment: 'References the note being corrected' })
  correctsNoteId: string | null;

  @CreateDateColumn()
  createdAt: Date;
  // No updatedAt — append-only
}
