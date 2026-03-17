import express from 'express';

export const createApp = () => {
  const app = express();

  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.status(200).json({
      service: '@repo/auth',
      status: 'ok',
      phase: 'phase-1',
    });
  });

  return app;
};

