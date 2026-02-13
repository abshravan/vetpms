import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = this.usersRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      role: dto.role,
      phone: dto.phone,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateRefreshToken(userId: string, refreshTokenHash: string | null): Promise<void> {
    await this.usersRepository.update(userId, { refreshTokenHash });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'phone', 'isActive', 'createdAt'],
    });
  }
}
