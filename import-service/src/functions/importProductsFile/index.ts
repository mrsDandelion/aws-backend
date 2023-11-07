import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'import',
        cors: true,
        authorizer: {
          type: 'TOKEN',
          name: 'basicAuthorizer',
          arn: 'arn:aws:lambda:us-east-1:925337882584:function:authorization-service-dev-basicAuthorizer'
        },
        request: {
          parameters: {
            querystrings: {
              name: true
            }
          }
        }
      },
    },
  ],
};
