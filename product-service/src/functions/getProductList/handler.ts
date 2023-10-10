import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { products } from 'src/mock-data/products';
import { APIGatewayProxyResult } from 'aws-lambda';

const getProductList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  return formatJSONResponse({
    statusCode: 200,
		body: {
			products,
		},
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
  }) as APIGatewayProxyResult;
};

export const main = middyfy(getProductList);
