import { Body, Controller, Get, NotFoundException, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UpdateProfileDto } from './dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    const user = await this.usersService.findById((req.user as { userId: string }).userId);
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      description: user.description
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async update(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile((req.user as { userId: string }).userId, dto);
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      description: user.description
    };
  }

  @Get(':id')
  async channel(@Req() req: Request) {
    const user = await this.usersService.getChannel(req.params.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      description: user.description,
      videos: user.videos
    };
  }
}
