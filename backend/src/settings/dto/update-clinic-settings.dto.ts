import {
  IsString,
  IsOptional,
  IsNumber,
  IsEmail,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class UpdateClinicSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  clinicName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultTaxRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(120)
  appointmentSlotMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  businessHoursStart?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  businessHoursEnd?: string;

  @IsOptional()
  @IsString()
  closedDays?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  invoicePaymentTermsDays?: number;

  @IsOptional()
  @IsString()
  invoiceFooter?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;
}
