import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TransactionType } from '../entities/inventory-transaction.entity';

export class CreateTransactionDto {
  @IsUUID()
  itemId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  visitId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
