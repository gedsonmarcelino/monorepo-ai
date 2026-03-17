import { createServer } from 'node:http';

import { createMessage } from '@repo/shared';
import { formatServiceName } from '@repo/utils';

const serviceName = formatServiceName('api');
const port = Number(process.env.PORT ?? 3000);

const server = createServer((_request, response) => {
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(
    JSON.stringify({
      service: serviceName,
      message: createMessage(serviceName),
    }),
  );
});

server.listen(port, () => {
  console.log(`${serviceName} listening on port ${port}`);
});

