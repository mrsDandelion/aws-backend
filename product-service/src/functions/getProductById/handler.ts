import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { products } from 'src/mock-data/products';

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = JSON.parse(JSON.stringify(event)).pathParameters;
	const product = products.find((product) => product.id === id);
	if (!product) {
		return formatJSONResponse({
			statusCode: 400,
			body: {
				message: 'Product not found',
			},
		});
	} else {
    return formatJSONResponse({
      statusCode: 200,
      body: {
        product,
      },
    });
  }  
};

export const main = middyfy(hello);
