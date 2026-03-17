export type AuthenticatedUser = {
  id: string;
  email: string;
  isActive: boolean;
};

export type AuthSession = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LoginInput = {
  email: string;
  password: string;
  deviceName?: string;
};

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthenticatedUser;
};

export type RefreshInput = {
  refreshToken: string;
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
  sessionId: string;
};

export type AuthContext = {
  user: AuthenticatedUser;
  session: AuthSession;
};

