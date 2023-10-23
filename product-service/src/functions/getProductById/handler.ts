import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import * as AWS from 'aws-sdk';

import schema from './schema';
import { APIGatewayProxyResult } from 'aws-lambda';

const getProductById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	try {
		console.log(event);
		const dynamo = new AWS.DynamoDB.DocumentClient({
			region: 'us-east-2'
		});

		const getProductsData = async () => {
			const scanResults = await dynamo.scan({
				TableName: process.env.PRODUCTS_TABLE,
			}).promise();

			return scanResults.Items;
		};

		const productsData = await getProductsData();
			
		const { id } = JSON.parse(JSON.stringify(event)).pathParameters;

		const product = productsData.find((product) => product.id === id);
		if (!product) {
			return formatJSONResponse({
				body: { error: 'Product not found' },
				statusCode: 400,
				headers: {
					'Access-Control-Allow-Origin': '*'
				},
			}) as APIGatewayProxyResult;
		} else {
			return formatJSONResponse({
				statusCode: 200,
				body: { product },
				headers: {
					'Access-Control-Allow-Origin': '*'
				},
			}) as APIGatewayProxyResult;
	}
	} catch {
		return formatJSONResponse({
			statusCode: 500,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
			}) as APIGatewayProxyResult;
  }
};

export const main = middyfy(getProductById);
