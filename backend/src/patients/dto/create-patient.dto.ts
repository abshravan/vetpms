import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { Species, Sex } from '../entities/patient.entity';

export class CreatePatientDto {
  @IsUUID()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Species)
  species: Species;

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
}
