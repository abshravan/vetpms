import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TreatmentStatus } from '../entities/treatment.entity';

export class UpdateTreatmentDto {
  @IsEnum(TreatmentStatus)
  @IsOptional()
  status?: TreatmentStatus;

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
