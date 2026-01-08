import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  private readonly queue: Queue;

  constructor() {
    this.queue = new Queue('video-processing', {
      connection: {
        url: process.env.REDIS_URL
      }
    });
  }

  async enqueueTranscode(payload: { videoId: string; sourceKey: string }) {
    await this.queue.add('transcode', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });
  }
}
