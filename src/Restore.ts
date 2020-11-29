import readline from 'readline';
import { s3ReadStream, sendMessage } from './lib/aws';
import { logger } from './lib/logger';
import { Event } from './types';

export class Restore {
  constructor(private readonly event: Event) {}

  async run() {
    const rl = readline.createInterface({
      input: s3ReadStream(this.event.path),
    });
    rl.on('line', async (line) => {
      rl.pause();
      const message = JSON.parse(line);
      await sendMessage(this.event.queueUrl, message);
      rl.resume();
    }).on('close', () => {
      logger.info(
        `All the messages from s3 backup file are written to ${this.event.queueUrl}`
      );
    });
  }
}
