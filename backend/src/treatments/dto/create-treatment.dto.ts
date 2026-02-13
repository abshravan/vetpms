import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TreatmentCategory } from '../entities/treatment.entity';

export class CreateTreatmentDto {
  @IsUUID()
  visitId: string;

  @IsUUID()
  patientId: string;

  @IsEnum(TreatmentCategory)
  @IsOptional()
  category?: TreatmentCategory;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  dosage?: string;

  @IsString()
  @IsOptional()
  dosageUnit?: string;

  @IsString()
  @IsOptional()
  route?: string;

  @IsString()
  @IsOptional()
  frequency?: string;

  @IsNumber()
  @IsOptional()
  durationDays?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  cost?: number;
}
