import React, { useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Modal, Card, Form, Input, InputNumber, DatePicker, Select, Button, message } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useContractsStore } from '@/store/useContractsStore';
import type { CreateContractDto } from '@/types/contract.types';

export const NewContractPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const {
    hostelList,
    selectedHostelId,
    createLoading,
    createContract,
    fetchHostelList,
    setSelectedHostelId,
  } = useContractsStore();

  useEffect(() => {
    fetchHostelList();

    // Set default values
    const startDate = dayjs();
    const endDate = startDate.add(12, 'month');
    form.setFieldsValue({
      startDate,
      endDate,
      monthlyRent: 3000000,
      electricityCostPerUnit: 3500,
      waterCostPerUnit: 15000,
      serviceFee: 200000,
      paymentCycle: 'MONTHLY',
      numberOfTenants: 1,
      terms: '1. Thanh toán tiền thuê vào ngày 5 hàng tháng\n2. Không được chuyển nhượng phòng',
    });
  }, []);

  // Khi chọn nhà trọ, tự động fill thông tin chủ nhà
  const handleHostelChange = (hostelId: number) => {
    setSelectedHostelId(hostelId);
    const selectedHostel = hostelList.find((h :any) => h.hostelId === hostelId);
    if (selectedHostel) {
      form.setFieldsValue({
        hostelId: selectedHostel.hostelId,
        ownerName: selectedHostel.ownerName || '',
        phoneNumberOwner: selectedHostel.contactPhone || '',
        monthlyRent: selectedHostel.price || form.getFieldValue('monthlyRent'),
      });
    }
  };

  const onFinish = async () => {
    try {
      const values = await form.validateFields();

      if (!values.hostelId) {
        message.warning('Vui lòng chọn nhà trọ');
        return;
      }

      const dto: CreateContractDto = {
        bookingId: values.bookingId || 0,
        hostelId: values.hostelId,
        ownerName: values.ownerName,
        phoneNumberOwner: values.phoneNumberOwner,
        tenantName: values.tenantName,
        phoneNumberTenant: values.phoneNumberTenant,
        cccd: values.cccd,
        tenantEmail: values.tenantEmail,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        monthlyRent: values.monthlyRent,
        electricityCostPerUnit: values.electricityCostPerUnit,
        waterCostPerUnit: values.waterCostPerUnit,
        serviceFee: values.serviceFee,
        paymentCycle: values.paymentCycle,
        numberOfTenants: values.numberOfTenants,
        terms: values.terms,
        notes: values.notes,
      };

      await createContract(dto);
      message.success('Tạo hợp đồng thành công!');
      form.resetFields();
      setSelectedHostelId(null);
      navigate('/contracts', { replace: true });
    } catch (err: any) {
      Modal.error({
        title: 'Tạo hợp đồng thất bại',
        content: err?.response?.data?.message || err?.message || String(err),
      });
    }
  };

  return (
    <MainLayout>
      <div className="contracts-page">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Tạo hợp đồng mới</h1>
          <Button onClick={() => navigate('/contracts')}>Quay lại danh sách</Button>
        </div>

        {/* Select nhà trọ */}
        <Card className="mb-4" title="Chọn nhà trọ" size="small">
          <Select
            style={{ width: '100%' }}
            placeholder="Chọn nhà trọ"
            value={selectedHostelId}
            onChange={handleHostelChange}
            showSearch
            optionFilterProp="label"
            options={hostelList.map((h: any) => ({
              value: h.hostelId,
              label: `${h.hostelRoomCode || h.roomCode || h.hostelId} - ${h.name} - ${(h.status || 'unknown').toUpperCase()}`,
            }))}
          />
        </Card>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="hostelId" hidden><Input /></Form.Item>

          <Card title="Bên A - Thông tin chủ nhà" className="mb-4" size="small">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Tên chủ nhà" name="ownerName" rules={[{ required: true, message: 'Vui lòng nhập tên chủ nhà' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Số điện thoại chủ nhà" name="phoneNumberOwner" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }, { pattern: /^[0-9]{10}$/, message: 'SĐT phải có 10 chữ số' }]}>
                <Input />
              </Form.Item>
            </div>
          </Card>

          <Card title="Bên B - Thông tin khách hàng" className="mb-4" size="small">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Họ tên khách hàng" name="tenantName" rules={[{ required: true, message: 'Vui lòng nhập tên khách' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Số điện thoại khách hàng" name="phoneNumberTenant" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }, { pattern: /^[0-9]{10}$/, message: 'SĐT phải có 10 chữ số' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="CCCD/CMND" name="cccd" rules={[{ pattern: /^[0-9]{9,12}$/, message: 'CCCD không hợp lệ' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Email khách hàng" name="tenantEmail" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                <Input />
              </Form.Item>
            </div>
          </Card>

          <Card title="Thông tin hợp đồng" className="mb-4" size="small">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Ngày bắt đầu" name="startDate" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
              <Form.Item label="Ngày kết thúc" name="endDate" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
              <Form.Item label="Tiền thuê hàng tháng (VNĐ)" name="monthlyRent" rules={[{ required: true, message: 'Vui lòng nhập tiền thuê' }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
              <Form.Item label="Giá điện (VNĐ/kWh)" name="electricityCostPerUnit" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
              <Form.Item label="Giá nước (VNĐ/m³)" name="waterCostPerUnit" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
              <Form.Item label="Phí dịch vụ (VNĐ)" name="serviceFee" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
              <Form.Item label="Chu kỳ thanh toán" name="paymentCycle" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="MONTHLY">Hàng tháng</Select.Option>
                  <Select.Option value="QUARTERLY">Hàng quý</Select.Option>
                  <Select.Option value="YEARLY">Hàng năm</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Số lượng người thuê" name="numberOfTenants" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </div>
            <Form.Item label="Điều khoản hợp đồng" name="terms">
              <Input.TextArea rows={6} />
            </Form.Item>
            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Card>

          <Form.Item name="bookingId" hidden><Input /></Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => navigate('/contracts')}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={createLoading}>
              Tạo hợp đồng
            </Button>
          </div>
        </Form>
      </div>
    </MainLayout>
  );
};

export default NewContractPage;
