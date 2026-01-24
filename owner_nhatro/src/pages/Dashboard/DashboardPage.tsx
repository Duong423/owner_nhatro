// Dashboard page
import { MainLayout } from '@/layouts/MainLayout';

export const DashboardPage = () => {
  return (
    <MainLayout>
      <div className="dashboard-page">
        <h1>Dashboard</h1>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Tổng số phòng</h3>
            <p className="stat-number">24</p>
          </div>
          <div className="stat-card">
            <h3>Phòng đã cho thuê</h3>
            <p className="stat-number">18</p>
          </div>
          <div className="stat-card">
            <h3>Phòng trống</h3>
            <p className="stat-number">6</p>
          </div>
          <div className="stat-card">
            <h3>Doanh thu tháng này</h3>
            <p className="stat-number">54,000,000đ</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
