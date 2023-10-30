import type { AWS } from '@serverless/typescript';

import importProductsFile from '@functions/importProductsFile';
import importFileParser from '@functions/importFileParser';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      SQS_URL: 'https://sqs.us-west-1.amazonaws.com/925337882584/catalogItemsQueue'
    },
    iamRoleStatements: [
        {
          'Effect': 'Allow',
          'Action': [
            's3:*',
          ],
          'Resource': [
            'arn:aws:s3:::aws-uploaded-bucket/*'
          ],
        },
        {
          'Effect': 'Allow',
          'Action': [
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:PutLogEvents'
          ],
          'Resource': ['*']
        },
        {
          "Effect": "Allow",
          "Action": [
            "sqs:*"
          ],
          "Resource": "arn:aws:sqs:us-west-1:925337882584:catalogItemsQueue",
        }
      ]
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
