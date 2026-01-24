// Home page component
import { MainLayout } from '@/layouts/MainLayout';

export const HomePage = () => {
  return (
    <MainLayout>
      <div className="home-page">
        <h1>Chào mừng đến với hệ thống quản lý nhà trọ</h1>
        <p>Quản lý phòng trọ, khách thuê, hợp đồng và thanh toán một cách dễ dàng.</p>
      </div>
    </MainLayout>
  );
};
