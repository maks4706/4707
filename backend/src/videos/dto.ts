import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { VideoVisibility } from '@prisma/client';

export class CreateVideoDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : value.split(',').map((tag) => tag.trim());
      } catch {
        return value.split(',').map((tag) => tag.trim());
      }
    }
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsEnum(VideoVisibility)
  visibility!: VideoVisibility;
}

export class CommentDto {
  @IsString()
  @MaxLength(300)
  body!: string;
}
