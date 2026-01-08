import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import multer from 'multer';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { OptionalJwtAuthGuard } from '../auth/optional.guard';
import { CommentDto, CreateVideoDto } from './dto';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: Number(process.env.UPLOAD_MAX_MB ?? 200) * 1024 * 1024 }
    })
  )
  async upload(@Req() req: Request, @Body() dto: CreateVideoDto, @UploadedFile() file: Express.Multer.File) {
    return this.videosService.createVideoWithUpload((req.user as { userId: string }).userId, dto, file);
  }

  @Get('search')
  async search(@Query('q') q: string, @Query('cursor') cursor?: string) {
    return this.videosService.search(q ?? '', cursor);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getVideo(@Req() req: Request, @Param('id') id: string) {
    const viewerId = (req.user as { userId: string } | null)?.userId;
    const video = await this.videosService.getVideoById(id, viewerId);
    await this.videosService.incrementView(id, viewerId ?? undefined);
    return video;
  }

  @Get(':id/comments')
  async listComments(@Param('id') id: string) {
    return this.videosService.listComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  @Throttle(10, 60)
  async comment(@Req() req: Request, @Param('id') id: string, @Body() dto: CommentDto) {
    return this.videosService.addComment(id, (req.user as { userId: string }).userId, dto.body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async like(@Req() req: Request, @Param('id') id: string) {
    return this.videosService.toggleLike(id, (req.user as { userId: string }).userId);
  }
}
