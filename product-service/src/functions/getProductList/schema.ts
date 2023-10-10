export default {
  type: "object",
  properties: {
    statusCode: { type: 'number' },
    body: { type: 'object' },
    headers: { type: 'object' },
  },
  required: ['statusCode', 'body']
} as const;
