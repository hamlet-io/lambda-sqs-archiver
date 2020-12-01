# lambda-sqs-archiver

Archives SQS messages to s3 and restores backed-up messages from s3 to SQS queue, function expects the event body to be of the below format,

```
export interface Event {
  queueLink: string;
  queueUrl: string;
  direction: EventDirection;
  delete: boolean;
  path: string;
}

export enum EventDirection {
  FromQueue = 'FromQueue',
  ToQueue = 'ToQueue',
}

```

**queueLink**(optional, if queueUrl is passed) Name of link in hamlet solution to get the queue details from, for example
if queueLink = 'CITIZEN', queue details are read from CITIZEN_URL, CITIZEN_NAME, CITIZEN_ARN environment variables

**queueUrl**(optional, if queueLink is passed) SQS queue url

**direction**(required) indicates whether to backup or restore the messages

**path**(required) s3 file path relative to `APPDATA_BUCKET/APPDATA_PREFIX`

**delete**(optional) indicates whether to delete the messages from the queue after the messages are backed up in s3 (default: false)

## Environment Variables

| variable            | description                              |
| ------------------- | ---------------------------------------- |
| LOG_LEVEL           | log level for pino, defaults to debug    |
| REGION              | AWS region, defaults to ap-southeast-2   |
| APPDATA_BUCKET      | S3 bucket for storing backed-up messages |
| APPDATA_PREFIX      | S3 prefix for storing backed-up messages |
| [queueLink]\_URL    | Queue URL                                |
| [queueLink]\_NAME   | Queue name                               |
| [queueLink]\_ARN    | Queue ARN                                |
| [queueLink]\_REGION | Queue AWS Region                         |

## How to invoike

```
aws lambda invoke \
    --function-name lambda-sqs-archiver \
    --invocation-type Event \
    --payload '{ "queueUrl": "http://localhost:4566/000000000000/lambda-sqs-archiver-dlq", direction: 'FromQueue' }' \
```

## Packaging

`npm run build` builds and packages the function using serverless, packaged artifact will be in `.serverless` directory

## Configuring in a hamlet solution

When using the function in a hamlet solution, link the lambda function to all the queues that need to be manipulated.

If `FromQueue`, set the role to `consume`. If `ToQueue`, set the role to `produce`. If both, set the role to `all`.

This will result in the function having all the necessary permissions on the queues that need to be manipulated. The 3 configuration is part of the standard configuration for a lambda function, so permissions on the S3 bucket will automatically be established.
