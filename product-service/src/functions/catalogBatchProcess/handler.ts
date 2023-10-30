import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { createProductData, createStockData } from '@libs/db';

import schema from './schema';
import { v4 as uuid } from 'uuid';
import { SNS } from 'aws-sdk';

const catalogBatchProcess: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
		const promises = event.Records.map((record) => {
			const productData = JSON.parse(record.body);
      const id = uuid();
      
			return [
        createProductData({
          id,
          title: productData.title,
          description: productData.description,
          price: Number(productData.price)
        }),

        createStockData({
          id,
          count: Number(productData.count)
        })
      ]
    });

		await Promise.all(promises.flat());
		const sns = new SNS();
		await sns.publish(
			{
				Subject: 'New Products',
				Message: `New products were added to the database in the amount of ${event.Records.length}`,
				TopicArn: process.env.TOPIC_ARN
			}, 
			(err) => {
					console.log('ERROR: ', err);
			}
		).promise();

		console.log('Notification was sent');

	} catch (e) {
		console.log(e.message);
	}
};

export const main = catalogBatchProcess;
