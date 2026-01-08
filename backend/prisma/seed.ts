import { PrismaClient, VideoVisibility } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@videohub.local' },
    update: {},
    create: {
      email: 'demo@videohub.local',
      passwordHash,
      displayName: 'Demo Creator',
      description: 'Welcome to VideoHub demo channel.'
    }
  });

  await prisma.video.createMany({
    data: [
      {
        ownerId: user.id,
        title: 'Getting Started with VideoHub',
        description: 'Intro video for the MVP platform.',
        tags: ['intro', 'videohub'],
        visibility: VideoVisibility.PUBLIC,
        sourceUrl: 's3://videohub/sample.mp4',
        thumbnailUrl: 's3://videohub/sample.jpg',
        viewCount: 120
      },
      {
        ownerId: user.id,
        title: 'Creator Tips',
        description: 'How to upload and share content.',
        tags: ['tips', 'upload'],
        visibility: VideoVisibility.PUBLIC,
        sourceUrl: 's3://videohub/sample2.mp4',
        thumbnailUrl: 's3://videohub/sample2.jpg',
        viewCount: 45
      }
    ],
    skipDuplicates: true
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
