import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { PrismaService } from '../common/prisma.service';
import { S3Service } from '../common/s3.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [VideosController],
  providers: [VideosService, PrismaService, S3Service]
})
export class VideosModule {}
