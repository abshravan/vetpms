import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class RecordVitalsDto {
  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsString()
  @IsOptional()
  temperatureUnit?: string;

  @IsInt()
  @IsOptional()
  heartRate?: number;

  @IsInt()
  @IsOptional()
  respiratoryRate?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  weightUnit?: string;

  @IsInt()
  @Min(1)
  @Max(9)
  @IsOptional()
  bodyConditionScore?: number;

  @IsInt()
  @Min(0)
  @Max(4)
  @IsOptional()
  painScore?: number;

  @IsString()
  @IsOptional()
  mucousMembraneColor?: string;

  @IsInt()
  @IsOptional()
  capillaryRefillTime?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
