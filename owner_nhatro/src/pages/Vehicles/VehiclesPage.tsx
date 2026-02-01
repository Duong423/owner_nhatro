import React from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Card, Button, Input, Table, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Vehicle } from '@/types/vehicle.types';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { CreateVehicleModal } from './modals/CreateVehicleModal';
import { EditVehicleModal } from './modals/EditVehicleModal';

const VehiclesPage: React.FC = () => {
  const {
    vehicles,
    loading,
    roomId,
    setRoomId,
    fetchVehicles,
    fetchByRoom,
    openCreateModal,
    openEditModal,
  } = useVehiclesStore();

  // Load all vehicles on mount
  React.useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'green';
      case 'INACTIVE':
        return 'orange';
      case 'DELETED':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'Đang hoạt động';
      case 'INACTIVE':
        return 'Không hoạt động';
      case 'DELETED':
        return 'Đã xóa';
      default:
        return status || 'N/A';
    }
  };

  const columns: ColumnsType<Vehicle> = [
    { title: 'Mã PB', dataIndex: 'vehicleId', key: 'vehicleId', width: 80 },
    { title: 'Mã phòng', dataIndex: 'roomCode', key: 'roomCode' },
    { title: 'Biển số', dataIndex: 'licensePlates', key: 'licensePlates' },
    { title: 'Người thuê', dataIndex: 'nameTenant', key: 'nameTenant' },
    { title: 'SĐT', dataIndex: 'phoneNumberTenant', key: 'phoneNumberTenant' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status', 
      width: 140,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      )
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: 'Hành động',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="vehicles-page">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý phương tiện</h1>
          <Space>
            <Input
              placeholder="Nhập roomId (numeric)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={{ width: 200 }}
            />
            <Button onClick={fetchByRoom} type="primary">
              Tìm theo roomId
            </Button>
            <Button onClick={fetchVehicles}>Tải lại</Button>
            <Button type="primary" onClick={openCreateModal}>
              + Thêm phương tiện
            </Button>
          </Space>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={vehicles}
            rowKey={(r) => String(r.vehicleId)}
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        <CreateVehicleModal />
        <EditVehicleModal />
      </div>
    </MainLayout>
  );
};

export default VehiclesPage;
