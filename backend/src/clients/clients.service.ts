import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationQueryDto, PaginatedResult } from '../common/dto/pagination-query.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}

  async create(dto: CreateClientDto): Promise<Client> {
    const existing = await this.clientsRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('A client with this email already exists');
    }

    const client = this.clientsRepository.create(dto);
    return this.clientsRepository.save(client);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Client>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown>[] = [];

    if (query.search) {
      const search = `%${query.search}%`;
      where.push(
        { firstName: ILike(search) },
        { lastName: ILike(search) },
        { email: ILike(search) },
        { phone: ILike(search) },
      );
    }

    const [data, total] = await this.clientsRepository.findAndCount({
      where: where.length > 0 ? where : undefined,
      relations: ['patients'],
      order: { lastName: 'ASC', firstName: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id },
      relations: ['patients'],
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);

    if (dto.email && dto.email !== client.email) {
      const existing = await this.clientsRepository.findOne({ where: { email: dto.email } });
      if (existing) {
        throw new ConflictException('A client with this email already exists');
      }
    }

    Object.assign(client, dto);
    return this.clientsRepository.save(client);
  }

  async deactivate(id: string): Promise<Client> {
    const client = await this.findOne(id);
    client.isActive = false;
    return this.clientsRepository.save(client);
  }
}
