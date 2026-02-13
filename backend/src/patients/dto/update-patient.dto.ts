import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Species, Sex } from '../entities/patient.entity';

export class UpdatePatientDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Species)
  @IsOptional()
  species?: Species;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsEnum(Sex)
  @IsOptional()
  sex?: Sex;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  weightUnit?: string;

  @IsString()
  @IsOptional()
  microchipNumber?: string;

  @IsString()
  @IsOptional()
  insuranceProvider?: string;

  @IsString()
  @IsOptional()
  insurancePolicyNumber?: string;

  @IsString()
  @IsOptional()
  allergies?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDeceased?: boolean;

  @IsDateString()
  @IsOptional()
  deceasedDate?: string;
}
