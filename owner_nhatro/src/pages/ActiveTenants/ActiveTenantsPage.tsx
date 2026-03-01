import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Card, Table, Alert, Input, Button, Tag, Avatar } from 'antd';
import { SearchOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TenantInfoDTO } from '@/types/tenant.types';
import { contractService } from '@/services/api/contract.service';

export const ActiveTenantsPage: React.FC = () => {
  const [tenants, setTenants] = useState<TenantInfoDTO[]>([]);
  const [filtered, setFiltered] = useState<TenantInfoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await contractService.getActiveTenants();
      setTenants(data);
      setFiltered(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách khách thuê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    const keyword = value.trim().toLowerCase();
    if (!keyword) {
      setFiltered(tenants);
      return;
    }
    setFiltered(
      tenants.filter(
        (t) =>
          t.name?.toLowerCase().includes(keyword) ||
          t.phone?.toLowerCase().includes(keyword) ||
          t.email?.toLowerCase().includes(keyword) ||
          t.cccd?.toLowerCase().includes(keyword) ||
          t.roomCode?.toLowerCase().includes(keyword) ||
          t.hostelName?.toLowerCase().includes(keyword)
      )
    );
  };

  const columns: ColumnsType<TenantInfoDTO> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Khách thuê',
      key: 'tenant',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} className="bg-indigo-500 flex-shrink-0" />
          <div>
            <div className="font-semibold text-gray-800">{record.name}</div>
            <div className="text-xs text-gray-400">{record.phone}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || <span className="text-gray-400">—</span>,
    },
    {
      title: 'CCCD',
      dataIndex: 'cccd',
      key: 'cccd',
      render: (cccd) => cccd || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Phòng',
      key: 'room',
      render: (_, record) => (
        <div>
          <Tag color="blue">{record.roomCode || '—'}</Tag>
          <div className="text-xs text-gray-500 mt-1">{record.hostelName}</div>
        </div>
      ),
    },
    {
      title: 'Mã hợp đồng',
      dataIndex: 'contractId',
      key: 'contractId',
      width: 120,
      render: (id) => <span className="font-mono text-indigo-600">#{id}</span>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: () => <Tag color="green">Đang thuê</Tag>,
    },
  ];

  return (
    <MainLayout>
      <div className="active-tenants-page p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý khách thuê</h1>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearch('');
              fetchTenants();
            }}
          >
            Làm mới
          </Button>
        </div>

        {error && <Alert message={error} type="error" showIcon className="mb-4" />}

        <Card>
          <div className="mb-4">
            <Input
              placeholder="Tìm theo tên, SĐT, email, CCCD, phòng..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 340 }}
            />
          </div>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="contractId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} khách thuê`,
            }}
            locale={{ emptyText: 'Không có khách thuê nào' }}
          />
        </Card>
      </div>
    </MainLayout>
  );
};

export default ActiveTenantsPage;
