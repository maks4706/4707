import { Worker } from 'bullmq';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { createWriteStream, promises as fs } from 'fs';
import { pipeline } from 'stream/promises';
import { join } from 'path';
import { spawn } from 'child_process';

const prisma = new PrismaClient();
const s3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? '',
    secretAccessKey: process.env.S3_SECRET_KEY ?? ''
  }
});
const bucket = process.env.S3_BUCKET ?? 'videohub';
const publicUrl = process.env.S3_PUBLIC_URL ?? '';

async function downloadToFile(key: string, target: string) {
  const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!response.Body) {
    throw new Error('Missing S3 body');
  }
  await pipeline(response.Body as NodeJS.ReadableStream, createWriteStream(target));
}

function runFfmpeg(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg failed with code ${code}`));
      }
    });
  });
}

async function uploadFile(key: string, filePath: string, contentType: string) {
  const body = await fs.readFile(filePath);
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType
    })
  );
  return `${publicUrl}/${key}`;
}

new Worker(
  'video-processing',
  async (job) => {
    const { videoId, sourceKey } = job.data as { videoId: string; sourceKey: string };
    const tempDir = join('/tmp', videoId);
    await fs.mkdir(tempDir, { recursive: true });
    const sourcePath = join(tempDir, 'source.mp4');
    await downloadToFile(sourceKey, sourcePath);

    const output360 = join(tempDir, '360p.mp4');
    const output720 = join(tempDir, '720p.mp4');
    const thumbnail = join(tempDir, 'thumbnail.jpg');

    await runFfmpeg(['-i', sourcePath, '-vf', 'scale=-2:360', '-c:v', 'libx264', '-preset', 'fast', '-crf', '28', '-c:a', 'aac', output360]);
    await runFfmpeg(['-i', sourcePath, '-vf', 'scale=-2:720', '-c:v', 'libx264', '-preset', 'fast', '-crf', '24', '-c:a', 'aac', output720]);
    await runFfmpeg(['-i', sourcePath, '-ss', '00:00:01', '-vframes', '1', thumbnail]);

    const asset360Key = `videos/${videoId}/360p.mp4`;
    const asset720Key = `videos/${videoId}/720p.mp4`;
    const thumbnailKey = `videos/${videoId}/thumbnail.jpg`;

    const url360 = await uploadFile(asset360Key, output360, 'video/mp4');
    const url720 = await uploadFile(asset720Key, output720, 'video/mp4');
    const thumbnailUrl = await uploadFile(thumbnailKey, thumbnail, 'image/jpeg');

    await prisma.videoAsset.createMany({
      data: [
        { videoId, resolution: '360p', url: url360 },
        { videoId, resolution: '720p', url: url720 }
      ]
    });

    await prisma.video.update({ where: { id: videoId }, data: { thumbnailUrl } });
    await fs.rm(tempDir, { recursive: true, force: true });
  },
  {
    connection: { url: process.env.REDIS_URL }
  }
);

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
