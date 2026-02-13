import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { VaccinationStatus } from '../entities/vaccination.entity';

export class UpdateVaccinationDto {
  @IsUUID()
  @IsOptional()
  visitId?: string;

  @IsEnum(VaccinationStatus)
  @IsOptional()
  status?: VaccinationStatus;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  lotNumber?: string;

  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @IsString()
  @IsOptional()
  route?: string;

  @IsString()
  @IsOptional()
  site?: string;

  @IsDateString()
  @IsOptional()
  dateAdministered?: string;

  @IsDateString()
  @IsOptional()
  nextDueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  cost?: number;
}
