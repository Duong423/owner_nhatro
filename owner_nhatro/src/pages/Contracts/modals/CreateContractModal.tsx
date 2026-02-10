import React, { useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Modal, Card, Descriptions, Form, Input, InputNumber, DatePicker, Select, Button } from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useContractsStore } from '@/store/useContractsStore';
import type { CreateContractDto } from '@/types/contract.types';
import type { Booking } from '@/types/booking.types';
import type { HostelDetail } from '@/types/room.types';
import type { Contract } from '@/types/contract.types';

export const CreateContractModal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [form] = Form.useForm();

  const { hostelDetail, hostelList, selectedHostelId, loadBookingData, isCreateMode, setIsCreateMode, createLoading, createContract, fetchHostelList, setSelectedHostelId } = useContractsStore();

  useEffect(() => {
    fetchHostelList();
  }, []);

  useEffect(() => {
    if (bookingId) {
      loadBookingData(Number(bookingId))
        .then(({ existingContract, booking }: { existingContract: Contract | null; booking?: Booking; hostel?: HostelDetail }) => {
          // Nếu đã tồn tại hợp đồng và hợp đồng đó không phải là TERMINATED/EXPIRED thì thông báo non-blocking và chuyển hướng
          if (existingContract && existingContract.status !== 'TERMINATED' && existingContract.status !== 'EXPIRED') {
            // Thay modal blocker bằng toast không chặn và điều hướng bằng replace
            setIsCreateMode(false);
            navigate('/contracts', { replace: true });
            return;
          }

          if (booking && booking.customerId) { // OK để tạo hợp đồng mới nếu hợp đồng cũ đã chấm dứt hoặc hết hạn
            const startDate = dayjs();
            const endDate = startDate.add(12, 'month');
            form.setFieldsValue({
              bookingId: booking.bookingId,
              ownerName: hostelDetail?.ownerName || '',
              phoneNumberOwner: hostelDetail?.contactPhone || '',
              tenantName: booking.customerName || '',
              phoneNumberTenant: booking.customerPhone || '',
              cccd: (booking as any).cccd || '',
              tenantEmail: booking.customerEmail || '',
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
            setIsCreateMode(true);
          } else {
            Modal.error({
              title: 'Không thể tạo hợp đồng',
              content: 'Khách vãng lai không có tài khoản. Vui lòng yêu cầu khách hàng đăng ký tài khoản trước khi tạo hợp đồng.',
              onOk: () => navigate('/contracts')
            });
          }
        })
        .catch((err: any) => {
          Modal.error({ title: 'Lỗi tải dữ liệu', content: err?.message || String(err), onOk: () => navigate('/contracts') });
        });
    }
  }, [bookingId]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      const dto: CreateContractDto = {
        bookingId: values.bookingId,
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

      // Dùng toast non-blocking và điều hướng bằng replace để xóa query params
      import('antd').then(({ message }) => message.success('Tạo hợp đồng thành công!'));
      setIsCreateMode(false);
      form.resetFields();
      navigate('/contracts', { replace: true });
    } catch (err: any) {
      Modal.error({ title: 'Tạo hợp đồng thất bại', content: err?.response?.data?.message || err?.message || String(err) });
    }
  };

  if (!isCreateMode) return null;

  return (
    <MainLayout>
      <div className="contracts-page">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Tạo hợp đồng mới</h1>
          <Button onClick={() => { setIsCreateMode(false); navigate('/contracts'); }}>Quay lại danh sách</Button>
        </div>

        {/* {hostelList && hostelList.length > 0 && (
          <Card className="mb-4" title="Chọn nhà trọ" size="small">
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn nhà trọ"
              value={selectedHostelId}
              onChange={(value) => setSelectedHostelId(value)}
              options={hostelList.map((h: any) => ({
                value: h.hostelId,
                label: `${h.hostelRoomCode || h.roomCode || h.hostelId} - ${h.name} - ${(h.status || 'unknown').toUpperCase()}`,
              }))}
            />
          </Card>
        )} */}

        {hostelDetail && (
          <Card className="mb-4" title="Thông tin nhà trọ" size="small">
            <Descriptions size="small" bordered>
              <Descriptions.Item label="Tên nhà trọ">{hostelDetail.name}</Descriptions.Item>
              <Descriptions.Item label="Diện tích">{hostelDetail.area}m²</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{hostelDetail.address}</Descriptions.Item>
              <Descriptions.Item label="Giá thuê">{hostelDetail.price}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Card title="Bên A - Thông tin chủ nhà" className="mb-4" size="small">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Tên chủ nhà" name="ownerName" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Số điện thoại chủ nhà" name="phoneNumberOwner" rules={[{ required: true }, { pattern: /^[0-9]{10}$/ }]}> 
                <Input />
              </Form.Item>
            </div>
          </Card>

          <Card title="Bên B - Thông tin khách hàng" className="mb-4" size="small">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Họ tên khách hàng" name="tenantName" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Số điện thoại khách hàng" name="phoneNumberTenant" rules={[{ required: true }, { pattern: /^[0-9]{10}$/ }]}>
                <Input />
              </Form.Item>
              <Form.Item label="CCCD/CMND" name="cccd" rules={[{ pattern: /^[0-9]{9,12}$/, message: 'CCCD không hợp lệ' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Email khách hàng" name="tenantEmail" rules={[{ type: 'email' }]}>
                <Input />
              </Form.Item>

            </div>
          </Card>

          <Card title="Thông tin hợp đồng" className="mb-4" size="small">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Ngày bắt đầu" name="startDate" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
              <Form.Item label="Ngày kết thúc" name="endDate" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
              <Form.Item label="Tiền thuê hàng tháng (VNĐ)" name="monthlyRent" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Giá điện (VNĐ/kWh)" name="electricityCostPerUnit" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Giá nước (VNĐ/m³)" name="waterCostPerUnit" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Phí dịch vụ (VNĐ)" name="serviceFee" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
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
            <Form.Item label="Điều khoản hợp đồng" name="terms"><Input.TextArea rows={6} /></Form.Item>
            <Form.Item label="Ghi chú" name="notes"><Input.TextArea rows={3} /></Form.Item>
          </Card>

          <Form.Item name="bookingId" hidden><Input /></Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => { setIsCreateMode(false); navigate('/contracts'); }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={createLoading}>Tạo hợp đồng</Button>
          </div>
        </Form>
      </div>
    </MainLayout>
  );
};

export default CreateContractModal;
