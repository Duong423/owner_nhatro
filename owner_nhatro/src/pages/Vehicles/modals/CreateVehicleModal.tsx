import React from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import type { CreateVehicleDto } from '@/types/vehicle.types';

export const CreateVehicleModal: React.FC = () => {
  const [form] = Form.useForm();
  const { createOpen, createLoading, closeCreateModal, createVehicle } = useVehiclesStore();

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const dto: CreateVehicleDto = {
        contractId: values.contractId || undefined,
        roomCode: values.roomCode,
        licensePlates: values.licensePlates,
      };

      const result = await createVehicle(dto);
      if (result) {
        form.resetFields();
      }
    } catch (err) {
      // Error handling is done in store
    }
  };

  const handleCancel = () => {
    closeCreateModal();
    form.resetFields();
  };

  return (
    <Modal
      title="Thêm phương tiện"
      open={createOpen}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleCreate}>
        <Form.Item
          label="Mã phòng"
          name="roomCode"
          rules={[{ required: true, message: 'Vui lòng nhập mã phòng' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Biển số (cách nhau bằng dấu phẩy)"
          name="licensePlates"
          rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}
        >
          <Input />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={createLoading}>
            Tạo
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
