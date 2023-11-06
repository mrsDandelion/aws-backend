import type { AWS } from '@serverless/typescript';

import { getProductList, getProductById, createProduct, catalogBatchProcess } from '@functions/index';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-auto-swagger'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: 'dev',
    region: 'us-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      PRODUCTS_TABLE: 'AWS_Products',
			STOCK_TABLE: 'AWS_Stocks',
      SQS_URL: {
        Ref: 'SQSQueue'
      },
      TOPIC_ARN: { Ref: 'SNSTopic' }
    },
    iamRoleStatements: [
        {
          Effect: "Allow",
          Action: [
            'dynamodb:Scan',
            "dynamodb:BatchGetItem",
            "dynamodb:BatchWriteItem",
            "dynamodb:DeleteItem",
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:Query",
            "dynamodb:UpdateItem"
          ],
          Resource: [
            "*"
          ],
        },
        {
          Effect: "Allow",
          Action: [
            'sqs:*'
          ],
          Resource: [
            { 'Fn::GetAtt': ['SQSQueue', 'Arn'], }
          ],
        },
        {
          Effect: "Allow",
          Action: [
            'sns:*'
          ],
          Resource: {
            Ref: 'SNSTopic'
          },
        }
      ]
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue',
        },
      },
      SNSTopic: {
				Type: 'AWS::SNS::Topic',
				Properties: {
					TopicName: 'createProductTopic'
				}
			},
      SNSTopicSubscription: {
				Type: 'AWS::SNS::Subscription',
				Properties: {
					Endpoint: 'mrsDandelion@yandex.ru',
					Protocol: 'email',
					TopicArn: {
						Ref: 'SNSTopic'
					},
          FilterPolicy: {
            type: ['added less']
          }
				}
			},
      SNSTopicSubscriptionEmail: {
				Type: 'AWS::SNS::Subscription',
				Properties: {
					Endpoint: 'drachukdarya93@gmail.com',
					Protocol: 'email',
					TopicArn: {
						Ref: 'SNSTopic'
					},
          FilterPolicy: {
            type: ['added more']
          }
				}
			},
    },
  },
  // import the function via paths
  functions: { getProductList, getProductById, createProduct, catalogBatchProcess },
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