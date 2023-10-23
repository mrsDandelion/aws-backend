import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import * as AWS from 'aws-sdk';
import { APIGatewayProxyResult } from 'aws-lambda';

const getProductList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
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

    const getStockData = async () => {
      const queryResults = await dynamo.scan({
        TableName: process.env.STOCK_TABLE,
      }).promise();

      return queryResults.Items;
    };

    const productsData = await getProductsData();

    const stockData = await getStockData();

    const products = productsData.map((product) => {
      const productStockData = stockData.find((stockData) => stockData.id === product.id);    
      return {
        ...product,
        count: productStockData.count ?? 0,
      };
    });

    return formatJSONResponse({
      statusCode: 200,
      body: {
        products: products,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
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

export const main = middyfy(getProductList);
