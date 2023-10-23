export default {
  type: "object",
  properties: {
    statusCode: { type: 'number' },
    body: { type: 'object' }
  },
  required: ['statusCode', 'body']
} as const;
