import path from 'path';

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
  AWS_REGION,
  APPDATA_BUCKET,
  APPDATA_PREFIX,
} = process.env;

export const config: AppConfig = {
  env: NODE_ENV || 'development',
  logLevel: LOG_LEVEL || 'debug',
  localFilePath: path.join(__dirname, '../../out/messages.json'),
  aws: {
    region: AWS_REGION || 'ap-southeast-2',
  },
  s3: {
    appdataBucket: APPDATA_BUCKET,
    appdataPrefix: APPDATA_PREFIX,
  },
};
