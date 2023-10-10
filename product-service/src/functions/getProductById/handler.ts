import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { products } from 'src/mock-data/products';
import { APIGatewayProxyResult } from 'aws-lambda';

const getProductById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = JSON.parse(JSON.stringify(event)).pathParameters;
	const product = products.find((product) => product.id === id);
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
};

export const main = middyfy(getProductById);
