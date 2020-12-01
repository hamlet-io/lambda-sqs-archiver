import path from 'path';
import { Event, QueueDetails } from './../types';

export interface AppConfig {
  env: string;
  logLevel: string;
  aws: {
    region: string;
  };
  s3: {
    appdataBucket?: string;
    appdataPrefix?: string;
  };

  localFilePath: string;
}

const {
  NODE_ENV,
  LOG_LEVEL,
  REGION,
  APPDATA_BUCKET,
  APPDATA_PREFIX,
} = process.env;

export const config: AppConfig = {
  env: NODE_ENV || 'development',
  logLevel: LOG_LEVEL || 'debug',
  localFilePath: path.join(__dirname, '../../out/messages.json'),
  aws: {
    region: REGION || 'ap-southeast-2',
  },
  s3: {
    appdataBucket: APPDATA_BUCKET,
    appdataPrefix: APPDATA_PREFIX,
  },
};

export const getQueueDetails = (event: Event): QueueDetails => {
  if (event.queueUrl) {
    return {
      url: event.queueUrl,
      region: config.aws.region,
    };
  }
  const queueLink = event.queueLink;
  return {
    url: process.env[`${queueLink}_URL`] as string,
    name: process.env[`${queueLink}_NAME`],
    arn: process.env[`${queueLink}_ARN`],
    region: process.env[`${queueLink}_REGION`] || config.aws.region,
  };
};
