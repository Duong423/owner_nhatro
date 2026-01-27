import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

// Danh sách menu để dễ quản lý và render
const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/rooms', label: 'Phòng trọ' },
  { path: '/tenants', label: 'Đặt trọ' },
  { path: '/contracts', label: 'Hợp đồng' },
  { path: '/payments', label: 'Thanh toán' },
];

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Có thể thêm confirm dialog ở đây nếu muốn
    logout();
    navigate('/login');
  };

  // Lấy chữ cái đầu của tên để làm Avatar
  const userInitial = (user?.fullName?.[0] || user?.email?.[0] || 'U').toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 h-16 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        
        {/* 1. Logo Section */}
        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md group-hover:bg-indigo-700 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
              HouseManager
            </span>
          </NavLink>

          {/* 2. Navigation (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* 3. User & Logout Section (Bên phải) */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100 ml-auto md:ml-0">
          
          {/* Info User */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-700 leading-tight">
              {user?.fullName || 'Người dùng'}
            </span>
            <span className="text-[10px] uppercase font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded tracking-wider">
              {user?.role || 'User'}
            </span>
          </div>

          {/* Avatar Circle */}
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
            {userInitial}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Hệ thống quản lý nhà trọ. 
            <span className="hidden sm:inline"> All rights reserved.</span>
          </p>
        </div>
      </footer>

    </div>
  );
};