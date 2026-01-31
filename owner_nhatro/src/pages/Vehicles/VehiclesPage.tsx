import React, { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Card, Button, Input, Form, Modal, Table, message, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Vehicle, CreateVehicleDto } from '@/types/vehicle.types';
import { vehicleService } from '@/services/api/vehicle.service';

const VehiclesPage: React.FC = () => {
  const [roomId, setRoomId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Load all vehicles on mount
  React.useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getOwnerVehicles();
      setVehicles(data);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tải danh sách phương tiện');
    } finally {
      setLoading(false);
    }
  };

  const fetchByRoom = async () => {
    if (!roomId || roomId.toString().trim() === '') {
      message.warning('Vui lòng nhập roomId để tìm kiếm');
      return;
    }

    // Validate that input is digits only (allow leading zeros)
    if (!/^\d+$/.test(roomId)) {
      message.warning('roomId phải là một chuỗi số (ví dụ: 004 hoặc 123)');
      return;
    }

    try {
      setLoading(true);
      // Keep original format (e.g., '004') so backend can match roomCode exactly
      const res = await vehicleService.getVehicleByRoomId(roomId);
      setVehicles(res ? [res] : []);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi khi tải phương tiện');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const dto: CreateVehicleDto = {
        contractId: values.contractId || undefined,
        roomCode: values.roomCode,
        licensePlates: values.licensePlates,
      };

      setCreateLoading(true);
      const created = await vehicleService.createVehicle(dto);
      message.success('Tạo phương tiện thành công!');
      setCreateOpen(false);
      form.resetFields();

      // Nếu đang hiển thị theo roomId và room code khớp, refresh
      if (roomId && created.roomCode && created.roomCode === String(values.roomCode)) {
        await fetchByRoom();
      } else {
        // nếu không, thêm tạm vào danh sách hiển thị
        setVehicles((prev) => [created, ...prev]);
      }
    } catch (err: any) {
      if (err.errorFields) {
        message.error('Vui lòng kiểm tra lại thông tin');
      } else {
        message.error(err?.response?.data?.message || 'Tạo phương tiện thất bại');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const columns: ColumnsType<Vehicle> = [
    { title: 'Mã PB', dataIndex: 'vehicleId', key: 'vehicleId', width: 80 },
    { title: 'Mã phòng', dataIndex: 'roomCode', key: 'roomCode' },
    { title: 'Biển số', dataIndex: 'licensePlates', key: 'licensePlates' },
    { title: 'Người thuê', dataIndex: 'nameTenant', key: 'nameTenant' },
    { title: 'SĐT', dataIndex: 'phoneNumberTenant', key: 'phoneNumberTenant' },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: 'Hành động',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => {
            setSelectedVehicle(record);
            editForm.setFieldsValue({ contractId: record.contractId, roomCode: record.roomCode, licensePlates: record.licensePlates });
            setEditOpen(true);
          }}>Sửa</Button>
        </Space>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="vehicles-page">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý phương tiện</h1>
          <Space>
            <Input placeholder="Nhập roomId (numeric)" value={roomId} onChange={(e) => setRoomId(e.target.value)} style={{ width: 200 }} />
            <Button onClick={fetchByRoom} type="primary">Tìm theo roomId</Button>            <Button onClick={fetchVehicles}>Tải lại</Button>            <Button type="primary" onClick={() => setCreateOpen(true)}>+ Thêm phương tiện</Button>
          </Space>
        </div>

        <Card>
          <Table columns={columns} dataSource={vehicles} rowKey={(r) => String(r.vehicleId)} loading={loading} pagination={{ pageSize: 10 }} />
        </Card>

        <Modal title="Thêm phương tiện" open={createOpen} onCancel={() => setCreateOpen(false)} footer={null}>
          <Form form={form} layout="vertical" onFinish={handleCreate}>
            
            <Form.Item label="Mã phòng" name="roomCode" rules={[{ required: true, message: 'Vui lòng nhập mã phòng' }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Biển số (cách nhau bằng dấu phẩy)" name="licensePlates" rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}>
              <Input />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button onClick={() => setCreateOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createLoading}>Tạo</Button>
            </div>
          </Form>
        </Modal>

        {/* Modal: Cập nhật phương tiện */}
        <Modal title="Cập nhật phương tiện" open={editOpen} onCancel={() => { setEditOpen(false); setSelectedVehicle(null); editForm.resetFields(); }} footer={null}>
          <Form form={editForm} layout="vertical" onFinish={async () => {
            try {
              const values = await editForm.validateFields();
              if (!selectedVehicle) return;
              setEditLoading(true);
              const dto = {
                contractId: values.contractId || undefined,
                roomCode: values.roomCode,
                licensePlates: values.licensePlates,
              };
              await vehicleService.updateVehicle(selectedVehicle.vehicleId, dto);
              message.success('Cập nhật phương tiện thành công!');
              setEditOpen(false);
              setSelectedVehicle(null);
              editForm.resetFields();
              await fetchVehicles();
            } catch (err: any) {
              if (err.errorFields) {
                message.error('Vui lòng kiểm tra lại thông tin');
              } else {
                message.error(err?.response?.data?.message || 'Cập nhật thất bại');
              }
            } finally {
              setEditLoading(false);
            }
          }}>
            

            <Form.Item label="Biển số (cách nhau bằng dấu phẩy)" name="licensePlates" rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}>
              <Input />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button onClick={() => { setEditOpen(false); setSelectedVehicle(null); editForm.resetFields(); }}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={editLoading}>Cập nhật</Button>
            </div>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default VehiclesPage;
