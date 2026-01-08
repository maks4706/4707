import { Injectable } from '@nestjs/common';
import { VideoVisibility } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommended(userId?: string, cursor?: string) {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

    const userTags = userId
      ? await this.prisma.viewEvent
          .findMany({
            where: { userId, createdAt: { gte: threeDaysAgo } },
            select: { video: { select: { tags: true } } }
          })
          .then((events) => events.flatMap((event) => event.video.tags))
      : [];

    const items = await this.prisma.video.findMany({
      where: {
        visibility: VideoVisibility.PUBLIC,
        OR: userTags.length
          ? [
              { tags: { hasSome: userTags } },
              { createdAt: { gte: threeDaysAgo } }
            ]
          : [{ createdAt: { gte: threeDaysAgo } }]
      },
      take: 10,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: { owner: true }
    });

    const trending = await this.prisma.video.findMany({
      where: { visibility: VideoVisibility.PUBLIC, createdAt: { gte: dayAgo } },
      orderBy: { viewCount: 'desc' },
      take: 5,
      include: { owner: true }
    });

    const combined = [...new Map([...items, ...trending].map((video) => [video.id, video])).values()];
    const nextCursor = combined.length === 10 ? combined[combined.length - 1].id : null;

    return { items: combined.slice(0, 10), nextCursor };
  }
}
