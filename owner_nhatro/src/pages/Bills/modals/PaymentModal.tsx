import React, { useState } from 'react';
import { Modal, Form, Select, Input, Button, message } from 'antd';
import type { PaymentDto } from '@/types/bill.types';
import { useBillsStore } from '@/store/useBillsStore';

const { TextArea } = Input;

interface PaymentModalProps {
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ onSuccess }) => {
  const { 
    selectedBill, 
    paymentModalOpen, 
    closePaymentModal, 
    confirmPayment 
  } = useBillsStore();
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedBill) return;

      setLoading(true);

      const dto: PaymentDto = {
        paymentMethod: values.paymentMethod,
        note: values.note,
      };

      await confirmPayment(selectedBill.billId, dto);
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
    closePaymentModal();
    form.resetFields();
  };

  return (
    <Modal
      title="Thanh toán hóa đơn"
      open={paymentModalOpen}
      onCancel={handleCancel}
      footer={null}
    >
      {selectedBill && (
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Mã hóa đơn:</span>
            <span className="font-semibold">{selectedBill.billId}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Kỳ thanh toán:</span>
            <span className="font-semibold">
              {selectedBill.billingMonth}/{selectedBill.billingYear}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tổng tiền:</span>
            <span className="font-bold text-indigo-600 text-lg">
              {formatCurrency(selectedBill.totalAmount)}
            </span>
          </div>
        </div>
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Phương thức thanh toán"
          name="paymentMethod"
          rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
        >
          <Select placeholder="Chọn phương thức">
            <Select.Option value="CASH">Tiền mặt</Select.Option>
            <Select.Option value="BANK_TRANSFER">Chuyển khoản</Select.Option>
            <Select.Option value="ZALO_PAY">Zalo Pay</Select.Option>
            <Select.Option value="MOMO">MoMo</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Ghi chú" name="note">
          <TextArea rows={3} placeholder="Ghi chú về thanh toán" />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Xác nhận thanh toán
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
