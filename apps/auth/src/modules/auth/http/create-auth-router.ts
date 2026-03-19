import { Router } from 'express';
import { z } from 'zod';

import {
  InactiveUserError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  SessionExpiredError,
  SessionRevokedError,
} from '../../../lib/errors/auth-errors.js';
import { AuthService } from '../auth-service.js';

type CreateAuthRouterInput = {
  authService: AuthService;
};

type AuthResponse = {
  status(code: number): {
    json(payload: unknown): unknown;
    send(): unknown;
  };
};

const loginSchema = z.object({
  deviceName: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const createAuthRouter = ({ authService }: CreateAuthRouterInput) => {
  const router = Router();

  router.post('/login', createLoginHandler({ authService }));
  router.post('/refresh', createRefreshHandler({ authService }));
  router.post('/logout', createLogoutHandler({ authService }));
  router.get('/me', createMeHandler({ authService }));

  return router;
};

export const createLoginHandler = ({ authService }: CreateAuthRouterInput) => {
  return async (
    request: {
      body: unknown;
    },
    response: AuthResponse,
  ) => {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      return response.status(400).json({
        error: 'validation_error',
        message: 'Request payload is invalid.',
      });
    }

    try {
      const result = await authService.login(parsed.data);
      return response.status(200).json(result);
    } catch (error) {
      return respondWithAuthError(response, error);
    }
  };
};

export const createRefreshHandler = ({ authService }: CreateAuthRouterInput) => {
  return async (
    request: {
      body: unknown;
    },
    response: AuthResponse,
  ) => {
    const parsed = refreshSchema.safeParse(request.body);

    if (!parsed.success) {
      return response.status(400).json({
        error: 'validation_error',
        message: 'Request payload is invalid.',
      });
    }

    try {
      const result = await authService.refresh(parsed.data);
      return response.status(200).json(result);
    } catch (error) {
      return respondWithAuthError(response, error);
    }
  };
};

export const createLogoutHandler = ({ authService }: CreateAuthRouterInput) => {
  return async (
    request: {
      body: unknown;
    },
    response: AuthResponse,
  ) => {
    const parsed = refreshSchema.safeParse(request.body);

    if (!parsed.success) {
      return response.status(400).json({
        error: 'validation_error',
        message: 'Request payload is invalid.',
      });
    }

    await authService.logout(parsed.data);

    return response.status(204).send();
  };
};

export const createMeHandler = ({ authService }: CreateAuthRouterInput) => {
  return async (
    request: {
      headers?: {
        authorization?: string;
      };
    },
    response: AuthResponse,
  ) => {
    const authorization = request.headers?.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return response.status(401).json({
        error: 'invalid_access_token',
        message: 'Access token is invalid.',
      });
    }

    const accessToken = authorization.slice('Bearer '.length).trim();

    if (!accessToken) {
      return response.status(401).json({
        error: 'invalid_access_token',
        message: 'Access token is invalid.',
      });
    }

    try {
      const result = await authService.me(accessToken);
      return response.status(200).json(result.user);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return response.status(401).json({
          error: 'invalid_access_token',
          message: 'Access token is invalid.',
        });
      }

      if (error instanceof InvalidRefreshTokenError) {
        return response.status(401).json({
          error: 'invalid_access_token',
          message: 'Access token is invalid.',
        });
      }

      return respondWithAuthError(response, error);
    }
  };
};

const respondWithAuthError = (response: AuthResponse, error: unknown) => {
  if (error instanceof InvalidCredentialsError) {
    return response.status(401).json({
      error: 'invalid_credentials',
      message: error.message,
    });
  }

  if (error instanceof InvalidRefreshTokenError) {
    return response.status(401).json({
      error: 'invalid_refresh_token',
      message: error.message,
    });
  }

  if (error instanceof InactiveUserError) {
    return response.status(403).json({
      error: 'inactive_user',
      message: error.message,
    });
  }

  if (error instanceof SessionExpiredError) {
    return response.status(403).json({
      error: 'session_expired',
      message: error.message,
    });
  }

  if (error instanceof SessionRevokedError) {
    return response.status(403).json({
      error: 'session_revoked',
      message: error.message,
    });
  }

  return response.status(500).json({
    error: 'internal_error',
    message: 'Unexpected internal error.',
  });
};
