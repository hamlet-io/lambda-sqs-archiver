import readline from 'readline';
import { s3ReadStream, sendMessage } from './lib/aws';
import { getQueueDetails } from './lib/config';
import { logger } from './lib/logger';
import { Event, QueueDetails } from './types';

export class Restore {
  queue: QueueDetails;
  constructor(private readonly event: Event) {
    this.queue = getQueueDetails(event);
  }

  async run() {
    const rl = readline.createInterface({
      input: s3ReadStream(this.event.path),
    });
    rl.on('line', async (line) => {
      rl.pause();
      const message = JSON.parse(line);
      await sendMessage(this.queue, message);
      rl.resume();
    }).on('close', () => {
      logger.info(
        `All the messages from s3 backup file are written to ${this.queue.url}`
      );
    });
  }
}
