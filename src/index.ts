import { Handler } from 'aws-lambda';
import 'source-map-support/register';
import { Backup } from './Backup';
import { logger } from './lib/logger';
import { Restore } from './Restore';
import { Event, EventDirection } from './types';

const REQUIRED_EVENT_ARGS = ['queueLink', 'direction', 'path'];

const validate = (event: any) => {
  const missing = REQUIRED_EVENT_ARGS.filter((arg) => event[arg] === undefined);
  if (missing.length > 0) {
    throw new Error(
      `Missing required event details: ${missing.map((arg) => arg).join(', ')}`
    );
  }
};

const handler: Handler<Event> = async function (event, context) {
  context.callbackWaitsForEmptyEventLoop = true;
  logger.info('Event object: %s', JSON.stringify(event));

  validate(event);

  if (event.direction === EventDirection.FromQueue) {
    const backup = new Backup(event);
    await backup.run();
    return 'Success';
  } else if (event.direction === EventDirection.ToQueue) {
    const restore = new Restore(event);
    await restore.run();
    return 'Success';
  }

  throw Error("event direction doesn't match");
};

exports.handler = handler;
