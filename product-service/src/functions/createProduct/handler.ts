import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import * as AWS from 'aws-sdk';
import { APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuid } from 'uuid';

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    console.log(event);
    const dynamo = new AWS.DynamoDB.DocumentClient({
      region: 'us-east-2'
    });

    const createProductData = async (item) => {
      return dynamo.put({
        TableName: process.env.PRODUCTS_TABLE,
        Item: item,
      }).promise();
    };
    
    const createStockData = async (item) => {
      return dynamo.put({
        TableName: process.env.STOCK_TABLE,
        Item: item
      }).promise();
    }

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
