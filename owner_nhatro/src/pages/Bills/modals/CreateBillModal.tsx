import React, { useState } from 'react';
import { Modal, Form, Select, Input, Button, message } from 'antd';
import type { CreateBillDto } from '@/types/bill.types';
import { useBillsStore } from '@/store/useBillsStore';

const { TextArea } = Input;

interface CreateBillModalProps {
  roomCode: string;
  onSuccess: () => void;
}

export const CreateBillModal: React.FC<CreateBillModalProps> = ({ 
  roomCode,
  onSuccess 
}) => {
  const { createModalOpen, closeCreateModal, createBill } = useBillsStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (createModalOpen && roomCode) {
      form.setFieldsValue({ roomCode });
    }
  }, [createModalOpen, roomCode, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const dto: CreateBillDto = {
        roomCode: values.roomCode,
        billingMonth: values.billingMonth,
        billingYear: values.billingYear,
        electricityCost: values.electricityCost,
        waterCost: values.waterCost,
        serviceCost: values.serviceCost,
        note: values.note,
      };

      await createBill(dto);
      form.resetFields();
      onSuccess();
    } catch (err: any) {
      if (err.errorFields) {
        message.error('Vui lòng kiểm tra lại thông tin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    closeCreateModal();
    form.resetFields();
  };

  return (
    <Modal
      title="Tạo hóa đơn mới"
      open={createModalOpen}
      onCancel={handleCancel}
      footer={null}
      zIndex={1001}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Mã phòng"
          name="roomCode"
          rules={[{ required: true, message: 'Vui lòng nhập mã phòng' }]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Tháng"
          name="billingMonth"
          rules={[{ required: true, message: 'Vui lòng chọn tháng' }]}
        >
          <Select placeholder="Chọn tháng">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
              <Select.Option key={month} value={month}>
                Tháng {month}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Năm"
          name="billingYear"
          rules={[{ required: true, message: 'Vui lòng nhập năm' }]}
        >
          <Input type="number" placeholder="2026" />
        </Form.Item>
        <Form.Item
          label="Tiền điện"
          name="electricityCost"
        >
          <Input type="number" placeholder="Ví dụ: 500000" />
        </Form.Item>
        <Form.Item
          label="Tiền nước"
          name="waterCost"
        >
          <Input type="number" placeholder="Ví dụ: 300000" />
        </Form.Item>
        <Form.Item
          label="Tiền dịch vụ"
          name="serviceCost"
        >
          <Input type="number" placeholder="Ví dụ: 200000" />
        </Form.Item>
        <Form.Item label="Ghi chú" name="note">
          <TextArea rows={3} placeholder="Nhớ thanh toán đúng hạn" />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Tạo hóa đơn
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
