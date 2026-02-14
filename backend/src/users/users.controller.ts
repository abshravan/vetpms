import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
// TODO: re-enable auth
// import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
// @UseGuards(JwtAuthGuard, RolesGuard) // TODO: re-enable auth
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    const { passwordHash, refreshTokenHash, ...safe } = user as any;
    return safe;
  }

  @Post()
  // @Roles('admin') // TODO: re-enable auth
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const { passwordHash, refreshTokenHash, ...safe } = user as any;
    return safe;
  }

  @Patch(':id')
  // @Roles('admin') // TODO: re-enable auth
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, dto);
    const { passwordHash, refreshTokenHash, ...safe } = user as any;
    return safe;
  }

  @Delete(':id')
  // @Roles('admin') // TODO: re-enable auth
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.deactivate(id);
    const { passwordHash, refreshTokenHash, ...safe } = user as any;
    return safe;
  }
}
