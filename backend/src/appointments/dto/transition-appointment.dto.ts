import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class TransitionAppointmentDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @IsString()
  @IsOptional()
  cancellationReason?: string;
}
