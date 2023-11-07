const basicAuthorizer = async (event, _context, callback) => {
  console.log('event.authorizationToken', event.authorizationToken);
  if (!event.authorizationToken) {
    return callback('Unauthorized');
  }

  try {
    console.log('process.env', process.env);
    const encodedCreds = event.authorizationToken.split(' ')[1];
    const buff = Buffer.from(encodedCreds, 'base64');
    const plainCreds = buff.toString('utf-8').split(':');
  
    const [login, password] = plainCreds;

    console.log('info', login, password, process.env[login]);

    if(!password || !login || !process.env[login]) {
      return callback('Unauthorized');
    }
    const passwordEnv = process.env[login];

    const effect = passwordEnv && password && (passwordEnv === password) ? 'Allow' : 'Deny';
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
    console.log('policyDocument', policyDocument);

    return callback(null, {
      principalId: login,
      policyDocument,
    })
  } catch {
    return callback('Forbidden');
  }  
};

export const main = basicAuthorizer;
