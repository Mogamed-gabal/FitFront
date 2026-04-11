export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface CurrentUser {
  id: string | number;
  email: string;
  role: string;
  [key: string]: unknown;
}

export interface ApiEnvelope<T> {
  data?: T;
  message?: string;
  error?: string;
}
