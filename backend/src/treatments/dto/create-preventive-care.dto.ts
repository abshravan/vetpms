import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PreventiveCareType } from '../entities/preventive-care.entity';

export class CreatePreventiveCareDto {
  @IsUUID()
  patientId: string;

  @IsEnum(PreventiveCareType)
  careType: PreventiveCareType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  productName?: string;

  @IsDateString()
  @IsOptional()
  lastAdministered?: string;

  @IsDateString()
  @IsOptional()
  nextDueDate?: string;

  @IsNumber()
  @IsOptional()
  frequencyDays?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
