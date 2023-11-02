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

      if(!productData.title) {
        return Promise.resolve();
      }
      
			return [
        createProductData({
          id,
          title: productData.title,
          description: productData.description || '',
          price: Number(productData.price) || 0
        }),

        createStockData({
          id,
          count: Number(productData.count) || 0
        })
      ]
    });

		await Promise.all(promises.flat());
		const sns = new SNS();

    console.log('SNS was created');
		await sns.publish(
			{
				Subject: 'New Products',
				Message: `New products were added to the database in the amount of ${event.Records.length}`,
				TopicArn: process.env.TOPIC_ARN,
        MessageAttributes: {
          type: {
            DataType: "String",
            StringValue: event.Records.length < 5 ? "added less" : "added more"
          }
        }
			}, 
			(err) => {
					console.log('ERROR in publish: ', err);
			}
		).promise().then(
      (data) => {
        console.log(`Message was sent to the topic ${process.env.TOPIC_ARN}`);
        console.log("MessageID is " + data.MessageId);
      }).catch(
        (err) => {
        console.error('ERROR in promise: ', err);
      });

		console.log('Notification was sent');

	} catch (e) {
		console.log(e.message);
	}
};

export const main = catalogBatchProcess;
