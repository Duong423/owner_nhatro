// JWT utilities
import type { JWTPayload } from '@/types/auth.types';

/**
 * Decode JWT token to get payload
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // Validate token
    if (!token || typeof token !== 'string') {
      console.error('Invalid token: not a string');
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token: must have 3 parts');
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload) return true;
  
  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
};

/**
 * Get user role from token
 */
export const getUserRole = (token: string): string | null => {
  const payload = decodeJWT(token);
  return payload?.role || null;
};

/**
 * Check if user has required role
 */
export const hasRole = (token: string, requiredRole: string): boolean => {
  const role = getUserRole(token);
  return role?.toLowerCase() === requiredRole.toLowerCase();
};
