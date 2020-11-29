export enum EventDirection {
  FromQueue = 'FromQueue',
  ToQueue = 'ToQueue',
}

export interface Event {
  queueUrl: string;
  direction: EventDirection;
  path: string;
  delete?: boolean;
}
