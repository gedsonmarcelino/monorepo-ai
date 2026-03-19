export type TAuthenticatedUser = {
  id: string;
  email: string;
  isActive: boolean;
};

export type TAuthSession = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TLoginInput = {
  email: string;
  password: string;
  deviceName?: string;
};

export type TLoginResult = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: TAuthenticatedUser;
};

export type TRefreshInput = {
  refreshToken: string;
};

export type TAuthTokenPayload = {
  sub: string;
  email: string;
  sessionId: string;
};

export type TAuthContext = {
  user: TAuthenticatedUser;
  session: TAuthSession;
};

