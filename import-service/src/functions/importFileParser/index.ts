import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
          bucket: 'aws-uploaded-bucket',
          event: 's3:ObjectCreated:*',
          existing: true,
          rules: [
            {
              prefix: 'uploaded/',
            }
          ],
      },
    },
  ],
};
