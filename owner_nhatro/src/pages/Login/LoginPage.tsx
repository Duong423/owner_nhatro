import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, Button } from 'antd';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      let message = error?.response?.data?.message || error?.message || 'Đăng nhập thất bại';
      if (message.includes('quyền') || message.includes('OWNER')) {
        message = 'Tài khoản không có quyền truy cập Owner Portal.';
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT SIDE: Branding & Image (Ẩn trên mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-slate-900/90 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" 
          alt="Apartment Building" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Branding Content */}
        <div className="relative z-20 flex flex-col justify-between h-full p-16 text-white">
          <div className="flex items-center gap-3">
             {/* Logo giả lập */}
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-wide">HouseManager</span>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Quản lý nhà trọ <br/> chưa bao giờ dễ dàng hơn.
            </h2>
            <p className="text-indigo-200 text-lg max-w-md">
              Kiểm soát phòng trống, quản lý hóa đơn điện nước và cư dân tất cả trong một nền tảng duy nhất dành cho chủ nhà.
            </p>
          </div>

          <div className="text-sm text-indigo-300">
            © 2026 Boarding House Management System
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          
          {/* Header Mobile Only Logo */}
          <div className="lg:hidden flex justify-center mb-6">
             <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
               <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
             </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Chào mừng trở lại</h2>
            <p className="mt-3 text-gray-500">Đăng nhập vào tài khoản chủ nhà (Owner)</p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <Alert message={errorMessage} type="error" showIcon className="mb-4" />
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              
              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 sm:text-sm ${
                      errors.email 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white'
                    }`}
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600 pl-1">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="group">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Mật khẩu
                  </label>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                      Quên mật khẩu?
                    </a>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 sm:text-sm ${
                      errors.password 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600 pl-1">{errors.password}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full"
                size="large"
              >
                Đăng nhập hệ thống
              </Button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Bạn chưa có tài khoản chủ nhà?{' '}
              <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Đăng ký ngay
              </a>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};