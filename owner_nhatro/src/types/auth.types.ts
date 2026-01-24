// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  result: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    userId: number;
    email: string;
    fullName: string;
    role: string;
  };
}

export interface UserInfo {
  id: number;
  email: string;
  role: string;
  fullName: string;
}

export interface JWTPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}
