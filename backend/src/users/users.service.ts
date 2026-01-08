import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(email: string, password: string, displayName: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { email, passwordHash, displayName }
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(id: string, data: { displayName?: string; description?: string; avatarUrl?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async getChannel(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        videos: {
          where: { visibility: 'PUBLIC' },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }
}
