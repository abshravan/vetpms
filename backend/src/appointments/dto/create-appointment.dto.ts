import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { AppointmentType } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsUUID()
  clientId: string;

  @IsUUID()
  patientId: string;

  @IsUUID()
  vetId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

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
