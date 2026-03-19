import express from 'express';

import { AuthService } from '../modules/auth/auth-service.js';
import { createAuthRouter } from '../modules/auth/http/create-auth-router.js';

type CreateAppInput = {
  authService?: AuthService;
};

export const createApp = ({ authService }: CreateAppInput = {}) => {
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
