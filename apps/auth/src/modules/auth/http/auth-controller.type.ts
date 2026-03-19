export type TAuthSuccessPayload = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: {
    email: string;
    id: string;
    isActive: boolean;
  };
};

export type TErrorPayload = {
  error: string;
  message: string;
};

export type TResponseRecorderState = {
  body: unknown;
  statusCode: number | null;
};
