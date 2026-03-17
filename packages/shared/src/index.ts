import { capitalize } from '@repo/utils';

export const createMessage = (serviceName: string): string => {
  return `Hello from ${capitalize(serviceName)}`;
};

