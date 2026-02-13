import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { NoteType } from '../entities/clinical-note.entity';

export class CreateClinicalNoteDto {
  @IsEnum(NoteType)
  @IsOptional()
  noteType?: NoteType;

  @IsObject()
  content: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    text?: string;
  };

  @IsUUID()
  @IsOptional()
  correctsNoteId?: string;
}
