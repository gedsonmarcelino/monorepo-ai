import { createMessage } from '@repo/shared';
import { formatServiceName } from '@repo/utils';

const serviceName = formatServiceName('worker');

console.log(createMessage(serviceName));

