export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials.');
    this.name = 'InvalidCredentialsError';
  }
}

export class InactiveUserError extends Error {
  constructor() {
    super('User is inactive.');
    this.name = 'InactiveUserError';
  }
}

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Refresh token is invalid.');
    this.name = 'InvalidRefreshTokenError';
  }
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Session is expired.');
    this.name = 'SessionExpiredError';
  }
}

export class SessionRevokedError extends Error {
  constructor() {
    super('Session is revoked.');
    this.name = 'SessionRevokedError';
  }
}

