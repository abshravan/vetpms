import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { AppointmentType } from '../entities/appointment.entity';

export class UpdateAppointmentDto {
  @IsUUID()
  @IsOptional()
  vetId?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsEnum(AppointmentType)
  @IsOptional()
  type?: AppointmentType;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
