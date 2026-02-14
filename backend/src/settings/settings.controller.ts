import { Controller, Get, Patch, Body } from '@nestjs/common';
// TODO: re-enable auth
// import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';
import { SettingsService } from './settings.service';
import { UpdateClinicSettingsDto } from './dto/update-clinic-settings.dto';

@Controller('settings')
// @UseGuards(JwtAuthGuard, RolesGuard) // TODO: re-enable auth
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  get() {
    return this.settingsService.get();
  }

  @Patch()
  // @Roles('admin') // TODO: re-enable auth
  update(@Body() dto: UpdateClinicSettingsDto) {
    return this.settingsService.update(dto);
  }
}
