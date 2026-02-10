// Dashboard page
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Card, Row, Col, Statistic, Table, Tag, Spin } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { roomService } from '@/services/api/room.service';
import { contractService } from '@/services/api/contract.service';
import { billService } from '@/services/api/bill.service';
import { formatCurrency } from '@/utils/helpers/formatters';
import type { Hostel, Contract } from '@/types';
import type { PaymentHistory } from '@/types/payment.types';

interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalContracts: number;
  activeContracts: number;
  totalRevenue: number;
  monthRevenue: number;
  totalBills: number;
  paidBills: number;
  unpaidBills: number;
}

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    totalContracts: 0,
    activeContracts: 0,
    totalRevenue: 0,
    monthRevenue: 0,
    totalBills: 0,
    paidBills: 0,
    unpaidBills: 0,
  });
  const [rooms, setRooms] = useState<Hostel[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [recentPayments, setRecentPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const [roomsDataWithStats, contractsData, allPayments, monthPayments] = await Promise.all([
        roomService.getMyHostelsWithStats(),
        contractService.getOwnerContracts(),
        billService.getPaymentHistory(),
        billService.getPaymentHistoryByMonth(currentMonth, currentYear),
      ]);

      setRooms(roomsDataWithStats.hostels);
      setContracts(contractsData);
      
      // Use stats from API
      const totalRooms = roomsDataWithStats.totalRooms;
      const occupiedRooms = roomsDataWithStats.occupiedRooms;
      const availableRooms = roomsDataWithStats.availableRooms;
      
      const totalContracts = contractsData.length;
      const activeContracts = contractsData.filter(c => c.status === 'ACTIVE').length;
      
      // Calculate revenue from payment history
      const totalRevenue = allPayments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
      const monthRevenue = monthPayments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
      
      // Payment stats
      const totalBills = allPayments.length;
      
      setStats({
        totalRooms,
        occupiedRooms,
        availableRooms,
        totalContracts,
        activeContracts,
        totalRevenue,
        monthRevenue,
        totalBills,
        paidBills: totalBills,
        unpaidBills: 0,
      });
      
      // Get recent 5 payments
      setRecentPayments(allPayments.slice(0, 5));
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'processing';
      case 'EXPIRED': return 'default';
      case 'TERMINATED': return 'error';
      default: return 'default';
    }
  };

  const getContractStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Đang hoạt động';
      case 'PENDING': return 'Chờ xử lý';
      case 'EXPIRED': return 'Đã hết hạn';
      case 'TERMINATED': return 'Đã chấm dứt';
      default: return status;
    }
  };

  const recentContractsColumns = [
    {
      title: 'Mã HĐ',
      dataIndex: 'contractId',
      key: 'contractId',
      width: 80,
    },
    {
      title: 'Khách thuê',
      dataIndex: 'tenantName',
      key: 'tenantName',
    },
    {
      title: 'Phòng',
      dataIndex: 'roomCode',
      key: 'roomCode',
      width: 100,
      render: (text: string, record: Contract) => record.roomCode || record.hostelRoomCode || '-',
    },
    {
      title: 'Giá thuê',
      dataIndex: 'monthlyRent',
      key: 'monthlyRent',
      width: 130,
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => (
        <Tag color={getContractStatusColor(status)}>
          {getContractStatusText(status)}
        </Tag>
      ),
    },
  ];

  const recentBillsColumns = [
    {
      title: 'Mã TT',
      dataIndex: 'paymentHistoryId',
      key: 'paymentHistoryId',
      width: 80,
    },
    {
      title: 'Phòng',
      dataIndex: 'roomCode',
      key: 'roomCode',
      width: 100,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'tenantName',
      key: 'tenantName',
    },
    {
      title: 'Kỳ',
      key: 'period',
      width: 100,
      render: (_: any, record: PaymentHistory) => `${record.billingMonth}/${record.billingYear}`,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      render: (amount: number) => (
        <span className="font-semibold text-blue-600">
          {formatCurrency(amount)}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Tổng quan hệ thống quản lý nhà trọ</p>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng số phòng"
                value={stats.totalRooms}
                prefix={<HomeOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="mt-2 text-sm text-gray-600">
                <CheckCircleOutlined className="text-green-500" /> {stats.occupiedRooms} đã thuê | 
                <CloseCircleOutlined className="text-gray-400 ml-2" /> {stats.availableRooms} trống
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Hợp đồng"
                value={stats.totalContracts}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div className="mt-2 text-sm text-gray-600">
                <CheckCircleOutlined className="text-green-500" /> {stats.activeContracts} đang hoạt động
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Doanh thu tổng"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#faad14' }}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <div className="mt-2 text-sm text-gray-600">
                Tháng này: {formatCurrency(stats.monthRevenue)}
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Hóa đơn đã thanh toán"
                value={stats.paidBills}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="mt-2 text-sm text-gray-600">
                Tổng: {stats.totalBills} hóa đơn
              </div>
            </Card>
          </Col>
        </Row>

        {/* Recent Contracts & Bills */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Hợp đồng gần đây" className="h-full">
              <Table
                columns={recentContractsColumns}
                dataSource={contracts.slice(0, 5)}
                rowKey="contractId"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Thanh toán gần đây" className="h-full">
              <Table
                columns={recentBillsColumns}
                dataSource={recentPayments}
                rowKey="paymentHistoryId"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};
