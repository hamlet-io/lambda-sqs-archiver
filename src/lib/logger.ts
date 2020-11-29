import PinoLogger from 'pino';
import { config } from './config';

export const logger = PinoLogger({
  messageKey: 'message',
  name: 'lambda-sqs-archiver',
  level: config.logLevel,
});
