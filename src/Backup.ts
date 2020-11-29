import fs from 'fs-extra';
import pLimit from 'p-limit';
import { deleteMessage, persistToS3, receiveAllMessages } from './lib/aws';
import { config } from './lib/config';
import { logger } from './lib/logger';
import { Event } from './types';

export class Backup {
  constructor(private readonly event: Event) {}

  async run() {
    logger.debug(`Collect all the messages from ${this.event.queueUrl}`);

    fs.ensureFileSync(config.localFilePath);
    const localFile = fs.createWriteStream(config.localFilePath);

    const messages = await receiveAllMessages(this.event.queueUrl);
    messages.map((message) => localFile.write(`${JSON.stringify(message)}\n`));
    localFile.end();
    logger.debug(
      `Collected ${messages.length} messages from ${this.event.queueUrl}`
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
      logger.debug(`Deleting backed up messages from ${this.event.queueUrl}`);
      const deleteMessages = messages.map((message) =>
        limit(async () => {
          await deleteMessage(
            this.event.queueUrl,
            message.ReceiptHandle as string
          );
          logger.debug(
            `Deleted ${JSON.stringify(message)} from ${this.event.queueUrl}`
          );
        })
      );

      await Promise.all(deleteMessages).catch((error: Error) => {
        logger.error(
          `Error deleting the messages from ${this.event.queueUrl} %s`,
          error
        );
      });
    }
  }
}
