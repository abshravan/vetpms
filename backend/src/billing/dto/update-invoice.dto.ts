import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { InvoiceStatus, PaymentMethod } from '../entities/invoice.entity';

export class UpdateInvoiceDto {
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class RecordPaymentDto {
  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
