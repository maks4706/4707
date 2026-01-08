import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { OptionalJwtAuthGuard } from '../auth/optional.guard';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get('recommended')
  async recommended(@Req() req: Request, @Query('cursor') cursor?: string) {
    const userId = (req.user as { userId: string } | null)?.userId;
    return this.feedService.getRecommended(userId ?? undefined, cursor);
  }
}
