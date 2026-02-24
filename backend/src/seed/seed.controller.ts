import { Controller, Post, HttpCode } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('demo')
  @HttpCode(200)
  async seedDemo() {
    const result = await this.seedService.seedDemoData();
    return result;
  }
}
