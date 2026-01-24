// Protected Route Component
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, hasOwnerRole } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasOwnerRole()) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        gap: '1rem'
      }}>
        <h2>Không có quyền truy cập</h2>
        <p>Bạn không có quyền truy cập trang này. Chỉ OWNER mới được phép.</p>
        <button onClick={() => window.location.href = '/login'}>
          Quay lại đăng nhập
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
