import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateVisitDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  clientId: string;

  @IsUUID()
  vetId: string;

  @IsUUID()
  @IsOptional()
  appointmentId?: string;

  @IsString()
  @IsOptional()
  chiefComplaint?: string;
}
