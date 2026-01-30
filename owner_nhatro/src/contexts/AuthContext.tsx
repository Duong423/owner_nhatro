// Auth context for managing authentication state
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { authService } from '@/services/api/auth.service';
import { decodeJWT, isTokenExpired } from '@/utils/helpers/jwt.utils';
import type { UserInfo } from '@/types/auth.types';

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasOwnerRole: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = authService.getAccessToken();
    if (token && !isTokenExpired(token)) {
      const payload = decodeJWT(token);
      if (payload) {
        // Try to get user info from localStorage
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Fallback to JWT payload
          setUser({
            id: 0,
            email: payload.sub,
            role: payload.role.replace('ROLE_', ''),
            fullName: payload.sub,
          });
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      // Handle response structure: response.result.accessToken
      const result = response.result;
      if (!result || !result.accessToken) {
        throw new Error('Không nhận được token từ server');
      }
      const accessToken = result.accessToken;
      const refreshToken = result.refreshToken;
      // Validate token format
      if (typeof accessToken !== 'string' || !accessToken.includes('.')) {
        throw new Error('Token không đúng định dạng');
      }
      // Save tokens
      authService.setAccessToken(accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      // Decode token to get user info
      const payload = decodeJWT(accessToken);
      if (!payload) {
        throw new Error('Token không hợp lệ');
      }
      // Check if user has OWNER role (role in JWT is "ROLE_OWNER")
      const userRole = payload.role.toUpperCase();
      if (!userRole.includes('OWNER')) {
        // Clear token and throw error
        authService.logout();
        throw new Error('Bạn không có quyền truy cập. Chỉ OWNER mới được phép.');
      }
      // Set user info from both response and JWT
      const userInfo = {
        id: result.userId,
        email: result.email,
        role: result.role,
        fullName: result.fullName,
      };
      setUser(userInfo);
      // Save user info to localStorage for persistence
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } catch (error: any) {
      // Clear any stored token
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    authService.logout();
  };

  const hasOwnerRole = (): boolean => {
    return user?.role.toUpperCase().includes('OWNER') || false;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout, hasOwnerRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
