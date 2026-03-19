import type { AuthService } from '../auth-service.js';

export type TCreateAuthRouterInput = {
  authService: AuthService;
};

export interface IAuthResponse {
  status(code: number): {
    json(payload: unknown): unknown;
    send(): unknown;
  };
}

