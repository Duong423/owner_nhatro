import React, { useEffect } from 'react';
import { Modal, Form, InputNumber, Input, message } from 'antd';
import { useBillsStore } from '@/store/useBillsStore';

interface EditBillModalProps {
  onSuccess?: () => void;
}

export const EditBillModal: React.FC<EditBillModalProps> = ({ onSuccess }) => {
  const { selectedBill, editModalOpen, closeEditModal, updateBill } = useBillsStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (editModalOpen && selectedBill) {
      form.setFieldsValue({
        electricityCost: selectedBill.electricityCost,
        waterCost: selectedBill.waterCost,
        serviceCost: selectedBill.serviceCost,
        note: selectedBill.note,
      });
    }
  }, [editModalOpen, selectedBill, form]);

  const handleSubmit = async (values: any) => {
    if (!selectedBill) return;

    try {
      await updateBill(selectedBill.billId, values);
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is already handled in store
    }
  };

  const handleCancel = () => {
    form.resetFields();
    closeEditModal();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <Modal
      title="Chỉnh sửa hóa đơn"
      open={editModalOpen}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText="Lưu"
      cancelText="Hủy"
      width={600}
    >
      {selectedBill && (
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <h4 className="font-semibold mb-2">Thông tin hóa đơn</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Mã HĐ:</span> <strong>#{selectedBill.billId}</strong>
            </div>
            <div>
              <span className="text-gray-600">Phòng:</span> <strong>{selectedBill.roomCode}</strong>
            </div>
            <div>
              <span className="text-gray-600">Tháng/Năm:</span>{' '}
              <strong>
                {selectedBill.billingMonth}/{selectedBill.billingYear}
              </strong>
            </div>
            <div>
              <span className="text-gray-600">Tiền phòng:</span>{' '}
              <strong>{formatCurrency(selectedBill.roomPrice)}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Người thuê:</span>{' '}
              <strong>{selectedBill.tenantName}</strong> - {selectedBill.tenantPhone}
            </div>
          </div>
        </div>
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Tiền điện"
          name="electricityCost"
          rules={[
            { required: true, message: 'Vui lòng nhập tiền điện' },
            { type: 'number', min: 0, message: 'Tiền điện phải >= 0' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            placeholder="Nhập tiền điện"
            addonAfter="VNĐ"
          />
        </Form.Item>

        <Form.Item
          label="Tiền nước"
          name="waterCost"
          rules={[
            { required: true, message: 'Vui lòng nhập tiền nước' },
            { type: 'number', min: 0, message: 'Tiền nước phải >= 0' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            placeholder="Nhập tiền nước"
            addonAfter="VNĐ"
          />
        </Form.Item>

        <Form.Item
          label="Tiền dịch vụ"
          name="serviceCost"
          rules={[
            { required: true, message: 'Vui lòng nhập tiền dịch vụ' },
            { type: 'number', min: 0, message: 'Tiền dịch vụ phải >= 0' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            placeholder="Nhập tiền dịch vụ"
            addonAfter="VNĐ"
          />
        </Form.Item>

        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditBillModal;
