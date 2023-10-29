import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

import schema from './schema';

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try{
    if(!event.queryStringParameters.name) {
      return formatJSONResponse({
        statusCode: 500,
        body: { error: 'Name is not provided' },
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  
    const createPresignedUrlWithClient = ({ region, bucket, key }) => {
      const client = new S3Client({ region });
      const command = new PutObjectCommand({ Bucket: bucket, Key: key });
      return getSignedUrl(client, command, { expiresIn: 3600 });
    };
  
    const clientUrl = await createPresignedUrlWithClient({
      region: "us-east-1",
      bucket: "aws-uploaded-bucket",
      key: `uploaded/${event.queryStringParameters.name}`,
    });
    
    return formatJSONResponse({
      statusCode: 200,
      body: { url: clientUrl },
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
    });
  } catch {
    return formatJSONResponse({
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

export const main = middyfy(importProductsFile);
