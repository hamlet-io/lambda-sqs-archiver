import AWSS3 from 'aws-sdk/clients/s3';
import AWSSQS from 'aws-sdk/clients/sqs';
import fs from 'fs-extra';
import pWhilst from 'p-whilst';
import { config } from './config';

export const sqs = new AWSSQS({
  apiVersion: '2012-11-05',
});

export const s3 = new AWSS3({
  apiVersion: '2012-11-05',
});
const RECEIVE_PARAMS = { MaxNumberOfMessages: 10, VisibilityTimeout: 10 };

// S3 utils

export const persistToS3 = async (filePath: string, s3Path: string) => {
  const stream = fs.createReadStream(filePath);
  await s3
    .upload({
      Bucket: config.s3.appdataBucket as string,
      Key: `${config.s3.appdataPrefix}/${s3Path}`,
      Body: stream,
    })
    .promise();
};

export const s3ReadStream = (s3Path: string) => {
  return s3
    .getObject({
      Bucket: config.s3.appdataBucket as string,
      Key: s3Path
        ? `${config.s3.appdataPrefix}/${s3Path}`
        : (config.s3.appdataPrefix as string),
    })
    .createReadStream();
};

// SQS utils
export const sendMessage = async (queueUrl: string, messageBody: string) => {
  await sqs
    .sendMessage({ QueueUrl: queueUrl, MessageBody: messageBody })
    .promise();
};

export const deleteMessage = async (queueUrl: string, receiptHandle: string) =>
  sqs
    .deleteMessage({ QueueUrl: queueUrl, ReceiptHandle: receiptHandle })
    .promise();

export const receiveMessagesBatch = async (queueUrl: string) => {
  const data = await sqs
    .receiveMessage({ ...RECEIVE_PARAMS, QueueUrl: queueUrl })
    .promise();
  return data.Messages ? data.Messages : null;
};

export const receiveAllMessages = async (queueUrl: string) => {
  let stopReceiving = false;
  let messages: AWSSQS.MessageList = [];
  await pWhilst(
    () => !stopReceiving,
    async () => {
      const messagesBatch = await receiveMessagesBatch(queueUrl);
      if (messagesBatch) {
        messages = messages.concat(messagesBatch);
      } else {
        stopReceiving = true;
      }
    }
  );
  return messages;
};
