import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicSettings } from './entities/clinic-settings.entity';
import { UpdateClinicSettingsDto } from './dto/update-clinic-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(ClinicSettings)
    private readonly settingsRepo: Repository<ClinicSettings>,
  ) {}

  async get(): Promise<ClinicSettings> {
    const settings = await this.settingsRepo.find({ take: 1 });
    if (settings.length === 0) {
      // Auto-create default settings if none exist
      const defaultSettings = this.settingsRepo.create({});
      return this.settingsRepo.save(defaultSettings);
    }
    return settings[0];
  }

  async update(dto: UpdateClinicSettingsDto): Promise<ClinicSettings> {
    const settings = await this.get();
    Object.assign(settings, dto);
    return this.settingsRepo.save(settings);
  }
}
