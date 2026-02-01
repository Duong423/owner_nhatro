import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import type { CreateVehicleDto } from '@/types/vehicle.types';

export const EditVehicleModal: React.FC = () => {
  const [form] = Form.useForm();
  const {
    editOpen,
    editLoading,
    selectedVehicle,
    closeEditModal,
    updateVehicle,
  } = useVehiclesStore();

  useEffect(() => {
    if (editOpen && selectedVehicle) {
      form.setFieldsValue({
        contractId: selectedVehicle.contractId,
        roomCode: selectedVehicle.roomCode,
        licensePlates: selectedVehicle.licensePlates,
      });
    }
  }, [editOpen, selectedVehicle, form]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedVehicle) return;

      const dto: CreateVehicleDto = {
        contractId: values.contractId || undefined,
        roomCode: values.roomCode,
        licensePlates: values.licensePlates,
      };

      const success = await updateVehicle(selectedVehicle.vehicleId, dto);
      if (success) {
        form.resetFields();
      }
    } catch (err) {
      // Error handling is done in store
    }
  };

  const handleCancel = () => {
    closeEditModal();
    form.resetFields();
  };

  return (
    <Modal
      title="Cập nhật phương tiện"
      open={editOpen}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleUpdate}>
        <Form.Item
          label="Biển số (cách nhau bằng dấu phẩy)"
          name="licensePlates"
          rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}
        >
          <Input />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={editLoading}>
            Cập nhật
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
