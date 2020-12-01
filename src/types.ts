export enum EventDirection {
  FromQueue = 'FromQueue',
  ToQueue = 'ToQueue',
}

export interface QueueDetails {
  url: string;
  name?: string;
  arn?: string;
  region: string;
}

export interface Event {
  queueLink: string;
  queueUrl: string;
  direction: EventDirection;
  path: string;
  delete?: boolean;
}
