import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PreventiveCareStatus } from '../entities/preventive-care.entity';

export class UpdatePreventiveCareDto {
  @IsString()
  @IsOptional()
  name?: string;

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

  @IsEnum(PreventiveCareStatus)
  @IsOptional()
  status?: PreventiveCareStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
