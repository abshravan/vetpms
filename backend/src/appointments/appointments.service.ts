import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
  APPOINTMENT_TRANSITIONS,
} from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { TransitionAppointmentDto } from './dto/transition-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { PaginatedResult } from '../common/dto/pagination-query.dto';
import { ClientsService } from '../clients/clients.service';
import { PatientsService } from '../patients/patients.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    private readonly clientsService: ClientsService,
    private readonly patientsService: PatientsService,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    // Validate references exist
    await this.clientsService.findOne(dto.clientId);
    const patient = await this.patientsService.findOne(dto.patientId);
    await this.usersService.findById(dto.vetId);

    // Verify patient belongs to client
    if (patient.clientId !== dto.clientId) {
      throw new BadRequestException('Patient does not belong to this client');
    }

    // Validate time range
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for double-booking (overlapping appointments for the same vet)
    await this.checkConflicts(dto.vetId, startTime, endTime);

    const appointment = this.appointmentsRepository.create({
      ...dto,
      startTime,
      endTime,
    });
    const saved = await this.appointmentsRepository.save(appointment);
    return this.findOne(saved.id);
  }

  async findAll(query: QueryAppointmentsDto): Promise<PaginatedResult<Appointment>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.appointmentsRepository
      .createQueryBuilder('appt')
      .leftJoinAndSelect('appt.client', 'client')
      .leftJoinAndSelect('appt.patient', 'patient')
      .leftJoinAndSelect('appt.vet', 'vet')
      .orderBy('appt.startTime', 'ASC')
      .skip(skip)
      .take(limit);

    if (query.dateFrom) {
      qb.andWhere('appt.startTime >= :dateFrom', { dateFrom: query.dateFrom });
    }
    if (query.dateTo) {
      qb.andWhere('appt.startTime <= :dateTo', { dateTo: query.dateTo });
    }
    if (query.vetId) {
      qb.andWhere('appt.vetId = :vetId', { vetId: query.vetId });
    }
    if (query.clientId) {
      qb.andWhere('appt.clientId = :clientId', { clientId: query.clientId });
    }
    if (query.patientId) {
      qb.andWhere('appt.patientId = :patientId', { patientId: query.patientId });
    }
    if (query.status) {
      qb.andWhere('appt.status = :status', { status: query.status });
    }
    if (query.search) {
      qb.andWhere(
        '(client.lastName ILIKE :search OR patient.name ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Exclude password fields from vet join
    qb.addSelect([]);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['client', 'patient', 'vet'],
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Can only update scheduled/confirmed appointments
    if (
      ![AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(appointment.status)
    ) {
      throw new BadRequestException(
        `Cannot update appointment in ${appointment.status} status`,
      );
    }

    const startTime = dto.startTime ? new Date(dto.startTime) : appointment.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : appointment.endTime;
    const vetId = dto.vetId || appointment.vetId;

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check conflicts if time or vet changed
    if (dto.startTime || dto.endTime || dto.vetId) {
      await this.checkConflicts(vetId, startTime, endTime, id);
    }

    Object.assign(appointment, {
      ...dto,
      ...(dto.startTime && { startTime }),
      ...(dto.endTime && { endTime }),
    });

    await this.appointmentsRepository.save(appointment);
    return this.findOne(id);
  }

  async transition(id: string, dto: TransitionAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);

    const allowedTransitions = APPOINTMENT_TRANSITIONS[appointment.status];
    if (!allowedTransitions.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${appointment.status} to ${dto.status}. ` +
          `Allowed: ${allowedTransitions.join(', ') || 'none (terminal state)'}`,
      );
    }

    appointment.status = dto.status;

    if (
      dto.status === AppointmentStatus.CANCELLED &&
      dto.cancellationReason
    ) {
      appointment.cancellationReason = dto.cancellationReason;
    }

    await this.appointmentsRepository.save(appointment);
    return this.findOne(id);
  }

  async getDaySchedule(date: string, vetId?: string): Promise<Appointment[]> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const qb = this.appointmentsRepository
      .createQueryBuilder('appt')
      .leftJoinAndSelect('appt.client', 'client')
      .leftJoinAndSelect('appt.patient', 'patient')
      .leftJoinAndSelect('appt.vet', 'vet')
      .where('appt.startTime >= :dayStart', { dayStart })
      .andWhere('appt.startTime <= :dayEnd', { dayEnd })
      .orderBy('appt.startTime', 'ASC');

    if (vetId) {
      qb.andWhere('appt.vetId = :vetId', { vetId });
    }

    return qb.getMany();
  }

  private async checkConflicts(
    vetId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<void> {
    const qb = this.appointmentsRepository
      .createQueryBuilder('appt')
      .where('appt.vetId = :vetId', { vetId })
      .andWhere('appt.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
      })
      // Overlap condition: existing.start < new.end AND existing.end > new.start
      .andWhere('appt.startTime < :endTime', { endTime })
      .andWhere('appt.endTime > :startTime', { startTime });

    if (excludeId) {
      qb.andWhere('appt.id != :excludeId', { excludeId });
    }

    const conflict = await qb.getOne();
    if (conflict) {
      const conflictStart = new Date(conflict.startTime).toLocaleTimeString();
      const conflictEnd = new Date(conflict.endTime).toLocaleTimeString();
      throw new ConflictException(
        `Vet already has an appointment from ${conflictStart} to ${conflictEnd}`,
      );
    }
  }
}
