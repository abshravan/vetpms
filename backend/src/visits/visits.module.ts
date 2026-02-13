import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visit } from './entities/visit.entity';
import { Vitals } from './entities/vitals.entity';
import { ClinicalNote } from './entities/clinical-note.entity';
import { VisitsService } from './visits.service';
import { VisitsController } from './visits.controller';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Visit, Vitals, ClinicalNote]),
    PatientsModule,
  ],
  providers: [VisitsService],
  controllers: [VisitsController],
  exports: [VisitsService],
})
export class VisitsModule {}
