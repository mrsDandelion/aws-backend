import * as AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-2'
});

export const createProductData = async (item) => {
    return dynamo.put({
      TableName: process.env.PRODUCTS_TABLE,
      Item: item,
    }).promise();
};
  
export const createStockData = async (item) => {
    return dynamo.put({
      TableName: process.env.STOCK_TABLE,
      Item: item
    }).promise();
}