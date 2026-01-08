import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { VideoVisibility } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { S3Service } from '../common/s3.service';
import { QueueService } from '../queue/queue.service';
import { sanitizeText } from '../common/sanitize';

@Injectable()
export class VideosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly queueService: QueueService
  ) {}

  async createVideoWithUpload(userId: string, dto: { title: string; description?: string; tags: string[]; visibility: VideoVisibility }, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File required');
    }
    if (!file.mimetype.startsWith('video/')) {
      throw new BadRequestException('Invalid file type');
    }
    const video = await this.prisma.video.create({
      data: {
        ownerId: userId,
        title: sanitizeText(dto.title),
        description: dto.description ? sanitizeText(dto.description) : undefined,
        tags: dto.tags.map(sanitizeText),
        visibility: dto.visibility,
        sourceUrl: ''
      }
    });

    const sourceKey = `videos/${video.id}/source${this.getExtension(file.originalname)}`;
    const sourceUrl = await this.s3Service.uploadObject(sourceKey, file.buffer, file.mimetype);

    await this.prisma.video.update({ where: { id: video.id }, data: { sourceUrl } });
    await this.queueService.enqueueTranscode({ videoId: video.id, sourceKey });

    return this.prisma.video.findUnique({ where: { id: video.id } });
  }

  async getVideoById(id: string, viewerId?: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: { owner: true, assets: true }
    });
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    if (video.visibility === VideoVisibility.PRIVATE && video.ownerId !== viewerId) {
      throw new ForbiddenException('Private video');
    }
    return video;
  }

  async incrementView(videoId: string, viewerId?: string) {
    await this.prisma.video.update({ where: { id: videoId }, data: { viewCount: { increment: 1 } } });
    await this.prisma.viewEvent.create({ data: { videoId, userId: viewerId } });
  }

  async listComments(videoId: string) {
    return this.prisma.comment.findMany({
      where: { videoId },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addComment(videoId: string, userId: string, body: string) {
    return this.prisma.comment.create({
      data: { videoId, userId, body: sanitizeText(body) },
      include: { user: true }
    });
  }

  async toggleLike(videoId: string, userId: string) {
    const existing = await this.prisma.like.findUnique({ where: { userId_videoId: { userId, videoId } } });
    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      return { liked: false };
    }
    await this.prisma.like.create({ data: { videoId, userId } });
    return { liked: true };
  }

  async search(query: string, cursor?: string) {
    const items = await this.prisma.video.findMany({
      where: {
        visibility: VideoVisibility.PUBLIC,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } }
        ]
      },
      take: 10,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { owner: true }
    });
    const nextCursor = items.length === 10 ? items[items.length - 1].id : null;
    return { items, nextCursor };
  }

  private getExtension(name: string) {
    const match = name.match(/\.[a-zA-Z0-9]+$/);
    return match ? match[0] : '.mp4';
  }
}
