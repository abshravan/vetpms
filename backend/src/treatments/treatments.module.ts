import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Treatment } from './entities/treatment.entity';
import { Vaccination } from './entities/vaccination.entity';
import { PreventiveCare } from './entities/preventive-care.entity';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Treatment, Vaccination, PreventiveCare])],
  providers: [TreatmentsService],
  controllers: [TreatmentsController],
  exports: [TreatmentsService],
})
export class TreatmentsModule {}
