import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { FeedModule } from './feed/feed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      ttl: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000) / 1000,
      limit: Number(process.env.RATE_LIMIT_MAX ?? 20)
    }),
    AuthModule,
    UsersModule,
    VideosModule,
    FeedModule
  ]
})
export class AppModule {}
