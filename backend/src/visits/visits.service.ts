import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit, VisitStatus } from './entities/visit.entity';
import { Vitals } from './entities/vitals.entity';
import { ClinicalNote } from './entities/clinical-note.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { RecordVitalsDto } from './dto/record-vitals.dto';
import { CreateClinicalNoteDto } from './dto/create-clinical-note.dto';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class VisitsService {
  constructor(
    @InjectRepository(Visit)
    private readonly visitsRepository: Repository<Visit>,
    @InjectRepository(Vitals)
    private readonly vitalsRepository: Repository<Vitals>,
    @InjectRepository(ClinicalNote)
    private readonly notesRepository: Repository<ClinicalNote>,
    private readonly patientsService: PatientsService,
  ) {}

  async createVisit(dto: CreateVisitDto): Promise<Visit> {
    const patient = await this.patientsService.findOne(dto.patientId);
    if (patient.clientId !== dto.clientId) {
      throw new BadRequestException('Patient does not belong to this client');
    }

    const visit = this.visitsRepository.create(dto);
    const saved = await this.visitsRepository.save(visit);

    // Update patient weight if provided during visit creation
    return this.findVisit(saved.id);
  }

  async findVisit(id: string): Promise<Visit> {
    const visit = await this.visitsRepository.findOne({
      where: { id },
      relations: ['patient', 'client', 'vet', 'vitals', 'vitals.recordedBy', 'clinicalNotes', 'clinicalNotes.author'],
      order: { vitals: { recordedAt: 'ASC' }, clinicalNotes: { createdAt: 'ASC' } },
    });
    if (!visit) {
      throw new NotFoundException('Visit not found');
    }
    return visit;
  }

  async findByPatient(patientId: string): Promise<Visit[]> {
    return this.visitsRepository.find({
      where: { patientId },
      relations: ['vet', 'vitals', 'clinicalNotes'],
      order: { createdAt: 'DESC' },
    });
  }

  async completeVisit(id: string): Promise<Visit> {
    const visit = await this.findVisit(id);
    if (visit.status === VisitStatus.COMPLETED) {
      throw new BadRequestException('Visit is already completed');
    }
    visit.status = VisitStatus.COMPLETED;
    await this.visitsRepository.save(visit);
    return this.findVisit(id);
  }

  async updateVisitStatus(id: string, status: VisitStatus): Promise<Visit> {
    const visit = await this.findVisit(id);
    if (visit.status === VisitStatus.COMPLETED) {
      throw new BadRequestException('Cannot change status of a completed visit');
    }
    visit.status = status;
    await this.visitsRepository.save(visit);
    return this.findVisit(id);
  }

  // ── Vitals ──

  async recordVitals(visitId: string, userId: string, dto: RecordVitalsDto): Promise<Vitals> {
    const visit = await this.findVisit(visitId);
    if (visit.status === VisitStatus.COMPLETED) {
      throw new BadRequestException('Cannot add vitals to a completed visit');
    }

    const vitals = this.vitalsRepository.create({
      visitId,
      recordedById: userId,
      ...dto,
    });
    const saved = await this.vitalsRepository.save(vitals);

    // Also update the patient's weight if recorded
    if (dto.weight) {
      await this.patientsService.update(visit.patientId, {
        weight: dto.weight,
        weightUnit: dto.weightUnit,
      });
    }

    return saved;
  }

  // ── Clinical Notes (APPEND-ONLY) ──

  async addClinicalNote(
    visitId: string,
    authorId: string,
    dto: CreateClinicalNoteDto,
  ): Promise<ClinicalNote> {
    const visit = await this.findVisit(visitId);
    if (visit.status === VisitStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot add notes to a completed visit. Create an addendum via a new visit.',
      );
    }

    const note = this.notesRepository.create({
      visitId,
      authorId,
      noteType: dto.noteType,
      content: dto.content,
      correctsNoteId: dto.correctsNoteId,
    });

    return this.notesRepository.save(note);
  }

  async getVisitNotes(visitId: string): Promise<ClinicalNote[]> {
    return this.notesRepository.find({
      where: { visitId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }
}
