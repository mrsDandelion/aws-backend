
import { GetObjectCommand, CopyObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

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

			await new Promise((resolve, reject) => {
				stream.Body.pipe(csv())
					.on('open', () => console.log('Opened'))
					.on('data', (data) => console.log(`Result: ${JSON.stringify(data)}`))
					.on('error', (err) => reject(err))
					.on('end', () => resolve('stream closed'))
			});

      console.log('stream was parsed')

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
