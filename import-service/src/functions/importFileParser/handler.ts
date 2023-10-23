
import { GetObjectCommand, CopyObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

const csv = require('csv-parser')

const importProductsFile = async (event) => {
  try{
    console.log('event', event);

    const s3Client = new S3Client({region: 'us-east-1'});
    const bucket = 'aws-uploaded-bucket';

    for (const record of event.Records) {
      const getCommand = new GetObjectCommand({
          Bucket: bucket,
          Key: `uploaded/${record.s3.object.key}`,
      })

			const stream = await s3Client.send(getCommand);

			await new Promise((resolve, reject) => {
				stream.Body.pipe(csv())
					.on('open', () => console.log('Opened'))
					.on('data', (data) => console.log(`Result: ${JSON.stringify(data)}`))
					.on('error', (err) => reject(err))
					.on('end', () => resolve('stream closed'))
			});

      await s3Client.send(new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/${record.s3.object.key}`,
          Key: `parsed/${record.s3.object.key}`,
      }));

      await s3Client.send(new DeleteObjectCommand({
          Bucket: bucket,
          Key: `uploaded/${record.s3.object.key}`,
      }));
		}

    return formatJSONResponse({
      statusCode: 200,
      body: { event },
    });
  } catch {
    return formatJSONResponse({
      statusCode: 500,
      body: { error: 'Something is wrong' },
    });
  }
};

export const main = middyfy(importProductsFile);
