const basicAuthorizer = async (event, _context, callback) => {
  console.log('event.authorizationToken', event.authorizationToken);
  if (!event.authorizationToken) {
    return callback('Unauthorized');
  }

  try {
    const encodedCreds = event.authorizationToken.split(' ')[1];
    const buff = Buffer.from(encodedCreds, 'base64');
    const plainCreds = buff.toString('utf-8').split(':');
  
    const [login, password] = plainCreds;
    const effect = process.env[login] === password ? 'Allow' : 'Deny';
  
    const policyDocument = {
        Version: '2012-10-17',
        Statement: [
            {
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: event.methodArn,
            },
        ],
    };

    return callback(null, {
        principalId: login,
        policyDocument,
    });
  } catch {
    return callback('Unauthorized');
  }  
};

export const main = basicAuthorizer;
