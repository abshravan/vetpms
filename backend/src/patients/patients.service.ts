import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Patient, Species } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationQueryDto, PaginatedResult } from '../common/dto/pagination-query.dto';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
    private readonly clientsService: ClientsService,
  ) {}

  async create(dto: CreatePatientDto): Promise<Patient> {
    // Verify client exists
    await this.clientsService.findOne(dto.clientId);

    const patient = this.patientsRepository.create(dto);
    return this.patientsRepository.save(patient);
  }

  async findAll(
    query: PaginationQueryDto & { species?: Species; clientId?: string },
  ): Promise<PaginatedResult<Patient>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.patientsRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.client', 'client')
      .orderBy('patient.name', 'ASC')
      .skip(skip)
      .take(limit);

    if (query.clientId) {
      qb.andWhere('patient.clientId = :clientId', { clientId: query.clientId });
    }

    if (query.species) {
      qb.andWhere('patient.species = :species', { species: query.species });
    }

    if (query.search) {
      qb.andWhere(
        '(patient.name ILIKE :search OR client.lastName ILIKE :search OR patient.microchipNumber ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['client'],
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  async findByClient(clientId: string): Promise<Patient[]> {
    return this.patientsRepository.find({
      where: { clientId },
      order: { name: 'ASC' },
    });
  }

  async update(id: string, dto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);
    Object.assign(patient, dto);
    return this.patientsRepository.save(patient);
  }

  async deactivate(id: string): Promise<Patient> {
    const patient = await this.findOne(id);
    patient.isActive = false;
    return this.patientsRepository.save(patient);
  }
}
