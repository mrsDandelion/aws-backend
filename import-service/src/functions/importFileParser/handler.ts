
import { GetObjectCommand, CopyObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as AWS from 'aws-sdk';

const csv = require('csv-parser')

const importProductsFile = async (event) => {
  try{
    console.log('event', event);

    const s3Client = new S3Client({region: 'us-east-1'});
    const bucket = 'aws-uploaded-bucket';

    for (const record of event.Records) {
      console.log(record.s3.object, record.s3.object.key);
      const getCommand = new GetObjectCommand({
          Bucket: bucket,
          Key: `${record.s3.object.key}`,
      })

			const stream = await s3Client.send(getCommand);

      console.log('stream', stream);

      const sqs = new AWS.SQS({ region: 'us-west-1' });

      const getQueueUrlFromArn = (arn) => {
        const [, , , region, accountId, queueName] = arn.split(':');
        return `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;
      };
      console.log('process.env.IMPORTED_SQS_QUEUE_ARN', process.env.SQS_QUEUE_ARN);

			await new Promise((resolve, reject) => {
				stream.Body.pipe(csv())
					.on('open', () => console.log('Opened'))
					.on('data', async (data) => {
            console.log(`Result: ${JSON.stringify(data)}`);
            const parameters = {
              type: 'added',
              data: data
            };
            await sqs.sendMessage({
              QueueUrl: getQueueUrlFromArn(process.env.SQS_QUEUE_ARN),
              MessageBody: JSON.stringify(parameters)
            }, (error, response) => { 
              if (error) {
                console.error('Failed to send message:', error);
              } else {
                console.log('Message sent successfully:', response);
              }
            }).promise();
          })
					.on('error', (err) => reject(err))
					.on('end', () => resolve('stream closed'))
			});

      console.log('stream was parsed');

      await s3Client.send(new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/${record.s3.object.key}`,
          Key: `${record.s3.object.key.replace('uploaded', 'parsed')}`,
      }));

      await s3Client.send(new DeleteObjectCommand({
          Bucket: bucket,
          Key: `${record.s3.object.key}`,
      }));
		}
  } catch (error){
    console.log('ERROR: ', error);
  }
};

export const main = importProductsFile;
