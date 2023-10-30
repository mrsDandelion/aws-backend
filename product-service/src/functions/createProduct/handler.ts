import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import { createProductData, createStockData } from '@libs/db';

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    console.log(event);

    const id = uuid();
    const productData = {
      id,
      description: event.body.description ?? '',
      price: event.body.price,
      title: event.body.title,
    };

    const stockData = {
      id,
      count: event.body.count ?? 0
    };

    if(typeof productData.price !== 'number' || typeof stockData.count !== 'number' || typeof productData.title !== 'string') {
      return formatJSONResponse({
          body: { error: 'Data is invalid' },
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
        }) as APIGatewayProxyResult;
    }
  
    await createProductData(productData);
    await createStockData(stockData);

    return formatJSONResponse({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }) as APIGatewayProxyResult;
  } catch {
    return formatJSONResponse({
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }) as APIGatewayProxyResult;
  } 
};

export const main = middyfy(createProduct);
