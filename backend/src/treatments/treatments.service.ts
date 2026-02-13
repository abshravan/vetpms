import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Treatment, TreatmentStatus } from './entities/treatment.entity';
import { Vaccination, VaccinationStatus } from './entities/vaccination.entity';
import { PreventiveCare, PreventiveCareStatus } from './entities/preventive-care.entity';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { UpdateVaccinationDto } from './dto/update-vaccination.dto';
import { CreatePreventiveCareDto } from './dto/create-preventive-care.dto';
import { UpdatePreventiveCareDto } from './dto/update-preventive-care.dto';

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentsRepo: Repository<Treatment>,
    @InjectRepository(Vaccination)
    private readonly vaccinationsRepo: Repository<Vaccination>,
    @InjectRepository(PreventiveCare)
    private readonly preventiveCareRepo: Repository<PreventiveCare>,
  ) {}

  // ── Treatments ──

  async createTreatment(userId: string, dto: CreateTreatmentDto): Promise<Treatment> {
    const treatment = this.treatmentsRepo.create({
      ...dto,
      administeredById: userId,
    });
    const saved = await this.treatmentsRepo.save(treatment);
    return this.findTreatment(saved.id);
  }

  async findTreatment(id: string): Promise<Treatment> {
    const treatment = await this.treatmentsRepo.findOne({
      where: { id },
      relations: ['patient', 'visit', 'administeredBy'],
    });
    if (!treatment) throw new NotFoundException('Treatment not found');
    return treatment;
  }

  async findTreatmentsByVisit(visitId: string): Promise<Treatment[]> {
    return this.treatmentsRepo.find({
      where: { visitId },
      relations: ['administeredBy'],
      order: { createdAt: 'ASC' },
    });
  }

  async findTreatmentsByPatient(patientId: string): Promise<Treatment[]> {
    return this.treatmentsRepo.find({
      where: { patientId },
      relations: ['visit', 'administeredBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateTreatment(id: string, dto: UpdateTreatmentDto): Promise<Treatment> {
    const treatment = await this.findTreatment(id);
    if (treatment.status === TreatmentStatus.COMPLETED || treatment.status === TreatmentStatus.CANCELLED) {
      throw new BadRequestException('Cannot modify a completed or cancelled treatment');
    }
    Object.assign(treatment, dto);
    await this.treatmentsRepo.save(treatment);
    return this.findTreatment(id);
  }

  // ── Vaccinations ──

  async createVaccination(userId: string, dto: CreateVaccinationDto): Promise<Vaccination> {
    const vaccination = this.vaccinationsRepo.create({
      ...dto,
      administeredById: dto.dateAdministered ? userId : null,
      status: dto.dateAdministered
        ? VaccinationStatus.ADMINISTERED
        : VaccinationStatus.SCHEDULED,
    });
    const saved = await this.vaccinationsRepo.save(vaccination);
    return this.findVaccination(saved.id);
  }

  async findVaccination(id: string): Promise<Vaccination> {
    const vacc = await this.vaccinationsRepo.findOne({
      where: { id },
      relations: ['patient', 'visit', 'administeredBy'],
    });
    if (!vacc) throw new NotFoundException('Vaccination record not found');
    return vacc;
  }

  async findVaccinationsByPatient(patientId: string): Promise<Vaccination[]> {
    return this.vaccinationsRepo.find({
      where: { patientId },
      relations: ['administeredBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateVaccination(id: string, userId: string, dto: UpdateVaccinationDto): Promise<Vaccination> {
    const vacc = await this.findVaccination(id);

    // If administering now, set the user and status
    if (dto.dateAdministered && vacc.status === VaccinationStatus.SCHEDULED) {
      vacc.administeredById = userId;
      vacc.status = VaccinationStatus.ADMINISTERED;
    }

    if (dto.status) vacc.status = dto.status;
    if (dto.manufacturer !== undefined) vacc.manufacturer = dto.manufacturer;
    if (dto.lotNumber !== undefined) vacc.lotNumber = dto.lotNumber;
    if (dto.expirationDate !== undefined) vacc.expirationDate = dto.expirationDate as any;
    if (dto.route !== undefined) vacc.route = dto.route;
    if (dto.site !== undefined) vacc.site = dto.site;
    if (dto.dateAdministered !== undefined) vacc.dateAdministered = dto.dateAdministered as any;
    if (dto.nextDueDate !== undefined) vacc.nextDueDate = dto.nextDueDate as any;
    if (dto.visitId !== undefined) vacc.visitId = dto.visitId;
    if (dto.notes !== undefined) vacc.notes = dto.notes;
    if (dto.cost !== undefined) vacc.cost = dto.cost;

    await this.vaccinationsRepo.save(vacc);
    return this.findVaccination(id);
  }

  async getUpcomingVaccinations(daysAhead: number = 30): Promise<Vaccination[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysAhead);

    return this.vaccinationsRepo.find({
      where: {
        status: VaccinationStatus.SCHEDULED,
        nextDueDate: LessThanOrEqual(cutoff),
      },
      relations: ['patient', 'patient.client'],
      order: { nextDueDate: 'ASC' },
    });
  }

  // ── Preventive Care ──

  async createPreventiveCare(dto: CreatePreventiveCareDto): Promise<PreventiveCare> {
    const care = this.preventiveCareRepo.create(dto);
    const saved = await this.preventiveCareRepo.save(care);
    return this.findPreventiveCare(saved.id);
  }

  async findPreventiveCare(id: string): Promise<PreventiveCare> {
    const care = await this.preventiveCareRepo.findOne({
      where: { id },
      relations: ['patient'],
    });
    if (!care) throw new NotFoundException('Preventive care plan not found');
    return care;
  }

  async findPreventiveCareByPatient(patientId: string): Promise<PreventiveCare[]> {
    return this.preventiveCareRepo.find({
      where: { patientId },
      order: { nextDueDate: 'ASC' },
    });
  }

  async updatePreventiveCare(id: string, dto: UpdatePreventiveCareDto): Promise<PreventiveCare> {
    const care = await this.findPreventiveCare(id);
    Object.assign(care, dto);

    // Auto-calculate next due date if marking as administered
    if (dto.lastAdministered && care.frequencyDays) {
      const next = new Date(dto.lastAdministered);
      next.setDate(next.getDate() + care.frequencyDays);
      care.nextDueDate = next;
      care.status = PreventiveCareStatus.ACTIVE;
    }

    await this.preventiveCareRepo.save(care);
    return this.findPreventiveCare(id);
  }

  async getOverduePreventiveCare(): Promise<PreventiveCare[]> {
    const today = new Date();
    return this.preventiveCareRepo.find({
      where: {
        status: PreventiveCareStatus.ACTIVE,
        nextDueDate: LessThanOrEqual(today),
      },
      relations: ['patient', 'patient.client'],
      order: { nextDueDate: 'ASC' },
    });
  }
}
