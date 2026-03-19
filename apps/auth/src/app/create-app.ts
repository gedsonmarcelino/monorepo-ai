import express from 'express';

import type { TCreateAppInput } from './create-app.type.js';
import { createAuthRouter } from '../modules/auth/http/create-auth-router.js';

export const createApp = ({ authService }: TCreateAppInput = {}) => {
  const app = express();

  app.use(express.json());

  if (authService) {
    app.use('/auth', createAuthRouter({ authService }));
  }

  app.get('/health', (_request, response) => {
    response.status(200).json({
      service: '@repo/auth',
      status: 'ok',
      phase: 'phase-1',
    });
  });

  return app;
};
