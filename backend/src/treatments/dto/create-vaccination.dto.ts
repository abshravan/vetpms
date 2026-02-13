import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateVaccinationDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  @IsOptional()
  visitId?: string;

  @IsString()
  @IsNotEmpty()
  vaccineName: string;

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
