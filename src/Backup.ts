import fs from 'fs-extra';
import pLimit from 'p-limit';
import { deleteMessage, persistToS3, receiveAllMessages } from './lib/aws';
import { config, getQueueDetails } from './lib/config';
import { logger } from './lib/logger';
import { Event, QueueDetails } from './types';

export class Backup {
  queue: QueueDetails;

  constructor(private readonly event: Event) {
    this.queue = getQueueDetails(event);
  }

  async run() {
    logger.debug(`Collect all the messages from ${this.queue.url}`);

    fs.ensureFileSync(config.localFilePath);
    const localFile = fs.createWriteStream(config.localFilePath);

    const messages = await receiveAllMessages(this.queue);
    messages.map((message) => localFile.write(`${JSON.stringify(message)}\n`));
    localFile.end();
    logger.debug(
      `Collected ${messages.length} messages from ${this.queue.url}`
    );
    logger.debug(
      `Saved messages to temporary local file ${config.localFilePath}`
    );

    // Persist messages to s3
    logger.debug(`Backing up messages to s3`);
    await persistToS3(config.localFilePath, this.event.path);
    logger.debug(`Backed up messages to s3`);

    // Delete backed-up messages
    const limit = pLimit(10);
    if (this.event.delete) {
      logger.debug(`Deleting backed up messages from ${this.queue.url}`);
      const deleteMessages = messages.map((message) =>
        limit(async () => {
          await deleteMessage(this.queue, message.ReceiptHandle as string);
          logger.debug(
            `Deleted ${JSON.stringify(message)} from ${this.queue.url}`
          );
        })
      );

      await Promise.all(deleteMessages).catch((error: Error) => {
        logger.error(
          `Error deleting the messages from ${this.queue.url} %s`,
          error
        );
      });
    }
  }
}
