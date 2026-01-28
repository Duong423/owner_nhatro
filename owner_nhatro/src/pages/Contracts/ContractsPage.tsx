// Contracts page - Quản lý hợp đồng
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { contractService } from '@/services/api/contract.service';
import { bookingService } from '@/services/api/booking.service';
import { roomService } from '@/services/api/room.service';
import { Button, Modal, Alert, Table, Tag, Card, Space, Form, Input, InputNumber, DatePicker, Descriptions, Select } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Contract, CreateContractDto } from '@/types/contract.types';
import type { Booking } from '@/types/booking.types';
import type { HostelDetail } from '@/types/room.types';
import dayjs from 'dayjs';

export const ContractsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Form states
  const [isCreateMode, setIsCreateMode] = useState(!!bookingId);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [hostelDetail, setHostelDetail] = useState<HostelDetail | null>(null);
  const [bookingHasContract, setBookingHasContract] = useState(false);
  
  // Detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [detailHostel, setDetailHostel] = useState<HostelDetail | null>(null);

  // Prevent duplicate load in StrictMode
  const loadedBookingRef = useRef<number | null>(null);

  useEffect(() => {
    fetchContracts();
    if (bookingId && loadedBookingRef.current !== Number(bookingId)) {
      loadedBookingRef.current = Number(bookingId);
      loadBookingData(Number(bookingId));
    }
  }, [bookingId]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await contractService.getOwnerContracts();
      setContracts(data);
    } catch (err: any) {
      console.error('Error fetching contracts:', err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const loadBookingData = async (id: number) => {
    try {
      setCreateLoading(true);
      // Check if contract already exists
      const existingContract = await contractService.getContractByBookingId(id);
      if (existingContract) {
        setBookingHasContract(true);
        setIsCreateMode(false);
        Modal.warning({
          title: 'Hợp đồng đã tồn tại',
          content: 'Booking này đã có hợp đồng. Bạn sẽ được chuyển đến danh sách hợp đồng.',
        });
        navigate('/contracts');
        return;
      } else {
        setBookingHasContract(false);
      }
      // Load booking data
      const booking = await bookingService.getBookingById(id);
      
      // Check if customer exists (not walk-in customer)
      if (!booking.customerId || booking.customerId === null) {
        setIsCreateMode(false);
        Modal.error({
          title: 'Không thể tạo hợp đồng',
          content: 'Khách vãng lai không có tài khoản. Vui lòng yêu cầu khách hàng đăng ký tài khoản trước khi tạo hợp đồng.',
          onOk: () => {
            navigate('/contracts');
          }
        });
        return;
      }
      
      setSelectedBooking(booking);
      
      // Load hostel detail
      const hostel = await roomService.getHostelDetail(booking.hostelId);
      setHostelDetail(hostel);
      
      // Pre-fill form
      const startDate = dayjs();
      const endDate = startDate.add(12, 'month');
      
      form.setFieldsValue({
        bookingId: booking.bookingId,
        startDate: startDate,
        endDate: endDate,
        monthlyRent: 3000000,
        electricityCostPerUnit: 3500,
        waterCostPerUnit: 15000,
        serviceFee: 200000,
        paymentCycle: 'MONTHLY',
        numberOfTenants: 1,
        terms: '1. Thanh toán tiền thuê vào ngày 5 hàng tháng\n2. Không được chuyển nhượng phòng\n3. Giữ gìn vệ sinh chung\n4. Báo trước 1 tháng nếu muốn chấm dứt hợp đồng',
        notes: '',
      });
      
      setIsCreateMode(true);
    } catch (err: any) {
      Modal.error({
        title: 'Lỗi tải dữ liệu',
        content: err?.response?.data?.message || err.message,
        onOk: () => {
          navigate('/contracts');
        }
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateContract = async () => {
    try {
      const values = await form.validateFields();
      setCreateLoading(true);

      const contractData: CreateContractDto = {
        bookingId: values.bookingId,
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

      await contractService.createContract(contractData);
      
      Modal.success({
        title: 'Tạo hợp đồng thành công!',
        content: 'Hợp đồng đã được tạo và lưu vào hệ thống.',
        onOk: () => {
          setIsCreateMode(false);
          form.resetFields();
          navigate('/contracts');
          fetchContracts();
        }
      });
    } catch (err: any) {
      if (err.errorFields) {
        Modal.error({
          title: 'Vui lòng kiểm tra lại thông tin',
          content: 'Có một số trường bắt buộc chưa được điền đầy đủ.',
        });
      } else {
        Modal.error({
          title: 'Tạo hợp đồng thất bại',
          content: err?.response?.data?.message || err.message,
        });
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleContractDurationChange = (duration: number | null) => {
    if (!duration) return;
    const startDate = form.getFieldValue('startDate');
    if (startDate) {
      const endDate = dayjs(startDate).add(duration, 'month');
      form.setFieldValue('endDate', endDate);
    }
  };

  const handleViewDetail = async (contract: Contract) => {
    setSelectedContract(contract);
    setDetailModalOpen(true);
    setDetailLoading(true);
    
    try {
      // Fetch booking data
      const bookingData = await bookingService.getBookingById(contract.bookingId);
      setDetailBooking(bookingData);
      
      // Fetch hostel data
      const hostelData = await roomService.getHostelDetail(bookingData.hostelId);
      setDetailHostel(hostelData);
    } catch (err: any) {
      console.error('Error loading detail data:', err);
      Modal.error({
        title: 'Không thể tải thông tin chi tiết',
        content: err?.response?.data?.message || err.message,
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSignContract = (contractId: number) => {
    Modal.confirm({
      title: 'Xác nhận ký hợp đồng',
      content: 'Bạn có chắc chắn muốn ký hợp đồng này?',
      okText: 'Xác nhận ký',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await contractService.signContract(contractId);
          Modal.success({
            content: 'Ký hợp đồng thành công!',
          });
          fetchContracts();
        } catch (err: any) {
          Modal.error({
            title: 'Ký hợp đồng thất bại',
            content: err?.response?.data?.message || err.message,
          });
        }
      },
    });
  };

  const handleTerminate = (contractId: number) => {
    Modal.confirm({
      title: 'Xác nhận chấm dứt hợp đồng',
      content: 'Bạn có chắc chắn muốn chấm dứt hợp đồng này?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await contractService.terminateContract(contractId);
          Modal.success({
            content: 'Chấm dứt hợp đồng thành công!',
          });
          fetchContracts();
        } catch (err: any) {
          Modal.error({
            title: 'Chấm dứt hợp đồng thất bại',
            content: err?.response?.data?.message || err.message,
          });
        }
      },
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'green',
      'PENDING': 'gold',
      'EXPIRED': 'default',
      'TERMINATED': 'red',
    };
    return statusMap[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'Đang hiệu lực',
      'PENDING': 'Chờ ký',
      'EXPIRED': 'Hết hạn',
      'TERMINATED': 'Đã chấm dứt',
    };
    return statusMap[status] || status;
  };

  const columns: ColumnsType<Contract> = [
    {
      title: 'Mã HĐ',
      dataIndex: 'contractId',
      key: 'contractId',
      width: 80,
    },
    {
      title: 'Người thuê',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (name, record) => (
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-xs text-gray-500">{record.tenantPhone}</div>
        </div>
      ),
    },
    {
      title: 'Phòng trọ',
      dataIndex: 'hostelName',
      key: 'hostelName',
      render: (name, record) => (
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-xs text-gray-500">{record.hostelAddress}</div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Tiền thuê',
      dataIndex: 'monthlyRent',
      key: 'monthlyRent',
      render: (amount) => (
        <span className="font-semibold text-indigo-600">{formatCurrency(amount)}</span>
      ),
      width: 130,
    },
    {
      title: 'Thời hạn',
      key: 'duration',
      render: (_, record) => (
        <div className="text-sm">
          <div>{formatDate(record.startDate)}</div>
          <div className="text-gray-500">đến {formatDate(record.endDate)}</div>
        </div>
      ),
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      width: 120,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
          {/* PENDING: Hiển thị cả 2 nút Ký và Hủy */}
          {record.status === 'PENDING' && (
            <>
              <Button
                size="small"
                type="primary"
                onClick={() => handleSignContract(record.contractId)}
              >
                Ký hợp đồng
              </Button>
              <Button
                size="small"
                danger
                onClick={() => handleTerminate(record.contractId)}
              >
                Hủy
              </Button>
            </>
          )}
          {/* ACTIVE: Chỉ hiển thị nút Hủy (đã ký rồi) */}
          {record.status === 'ACTIVE' && (
            <Button
              size="small"
              danger
              onClick={() => handleTerminate(record.contractId)}
            >
              Chấm dứt
            </Button>
          )}
          {/* TERMINATED: Không hiển thị nút nào */}
        </Space>
      ),
    },
  ];

  // Render create form
  if (isCreateMode) {
    return (
      <MainLayout>
        <div className="contracts-page">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Tạo hợp đồng mới</h1>
            <Button onClick={() => {
              setIsCreateMode(false);
              navigate('/contracts');
            }}>
              Quay lại danh sách
            </Button>
          </div>

          {/* Card 1: Thông tin nhà trọ */}
          {hostelDetail && (
            <Card className="mb-4" title="Thông tin nhà trọ" size="small">
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Tên nhà trọ">{hostelDetail.name}</Descriptions.Item>
                <Descriptions.Item label="Diện tích">{hostelDetail.area}m²</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>{hostelDetail.address}</Descriptions.Item>
                <Descriptions.Item label="Giá thuê">
                  <span className="font-semibold text-indigo-600">{formatCurrency(hostelDetail.price)}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Tiện nghi">{hostelDetail.amenities || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  {hostelDetail.description || 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Card 2: Thông tin chủ nhà */}
          {hostelDetail && (
            <Card className="mb-4" title="Bên A - Thông tin chủ nhà" size="small">
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Tên chủ nhà">{hostelDetail.ownerName}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{hostelDetail.contactPhone}</Descriptions.Item>
                <Descriptions.Item label="Email">{hostelDetail.contactEmail || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Người liên hệ">{hostelDetail.contactName}</Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Card 3: Thông tin khách hàng */}
          {selectedBooking && (
            <Card className="mb-4" title="Bên B - Thông tin khách hàng" size="small">
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Họ tên">{selectedBooking.customerName}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{selectedBooking.customerPhone}</Descriptions.Item>
                <Descriptions.Item label="Email">{selectedBooking.customerEmail || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Ngày đặt">
                  {formatDate(selectedBooking.bookingDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày nhận phòng">
                  {formatDate(selectedBooking.checkInDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Tiền đặt cọc">
                  <span className="font-semibold text-green-600">{formatCurrency(selectedBooking.depositAmount)}</span>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Card 4: Form điền thông tin hợp đồng */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateContract}
          >
            <Card title="Thông tin hợp đồng" className="mb-4" size="small">
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label="Ngày bắt đầu"
                  name="startDate"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                  />
                </Form.Item>
                <Form.Item
                  label="Ngày kết thúc"
                  name="endDate"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                  />
                </Form.Item>
                
                <Form.Item
                  label="Tiền thuê hàng tháng (VNĐ)"
                  name="monthlyRent"
                  rules={[{ required: true, message: 'Vui lòng nhập tiền thuê!' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="3000000"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
                
                <Form.Item
                  label="Giá điện (VNĐ/kWh)"
                  name="electricityCostPerUnit"
                  rules={[{ required: true, message: 'Vui lòng nhập giá điện!' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="3500"
                  />
                </Form.Item>
                
                <Form.Item
                  label="Giá nước (VNĐ/m³)"
                  name="waterCostPerUnit"
                  rules={[{ required: true, message: 'Vui lòng nhập giá nước!' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="15000"
                  />
                </Form.Item>
                
                <Form.Item
                  label="Phí dịch vụ (VNĐ)"
                  name="serviceFee"
                  rules={[{ required: true, message: 'Vui lòng nhập phí dịch vụ!' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="200000"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
                
                <Form.Item
                  label="Chu kỳ thanh toán"
                  name="paymentCycle"
                  rules={[{ required: true, message: 'Vui lòng chọn chu kỳ!' }]}
                >
                  <Select placeholder="Chọn chu kỳ thanh toán">
                    <Select.Option value="MONTHLY">Hàng tháng</Select.Option>
                    <Select.Option value="QUARTERLY">Hàng quý</Select.Option>
                    <Select.Option value="YEARLY">Hàng năm</Select.Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  label="Số lượng người thuê"
                  name="numberOfTenants"
                  rules={[{ required: true, message: 'Vui lòng nhập số người!' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="2"
                    min={1}
                  />
                </Form.Item>
              </div>
              
              <Form.Item
                label="Điều khoản hợp đồng"
                name="terms"
              >
                <Input.TextArea
                  rows={6}
                  placeholder="Nhập điều khoản hợp đồng..."
                />
              </Form.Item>
              
              <Form.Item
                label="Ghi chú"
                name="notes"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Ghi chú thêm (nếu có)..."
                />
              </Form.Item>
            </Card>

            <Form.Item name="bookingId" hidden>
              <Input />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button onClick={() => {
                setIsCreateMode(false);
                navigate('/contracts');
              }}>
                Hủy
              </Button>
              {!bookingHasContract && (
                <Button type="primary" htmlType="submit" loading={createLoading}>
                  Tạo hợp đồng
                </Button>
              )}
            </div>
          </Form>
        </div>
      </MainLayout>
    );
  }

  // Render list view
  return (
    <MainLayout>
      <div className="contracts-page">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý hợp đồng</h1>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon className="mb-4" />
        )}

        <Card>
          <Table
            columns={columns}
            dataSource={contracts}
            rowKey="contractId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} hợp đồng`,
            }}
          />
        </Card>

        {/* Modal Chi tiết hợp đồng */}
        <Modal
          open={detailModalOpen}
          onCancel={() => {
            setDetailModalOpen(false);
            setDetailBooking(null);
            setDetailHostel(null);
          }}
          footer={null}
          title="Chi tiết hợp đồng"
          width={900}
        >
          {detailLoading ? (
            <div className="text-center py-8">
              <Space direction="vertical">
                <div>Đang tải thông tin...</div>
              </Space>
            </div>
          ) : selectedContract && detailBooking && detailHostel ? (
            <div>
              {/* Card 1: Thông tin nhà trọ */}
              <Card className="mb-4" title="Thông tin nhà trọ" size="small">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Tên nhà trọ">{detailHostel.name}</Descriptions.Item>
                  <Descriptions.Item label="Chủ nhà">{detailHostel.ownerName}</Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ" span={2}>{detailHostel.address}</Descriptions.Item>
                  <Descriptions.Item label="Diện tích">{detailHostel.area}m²</Descriptions.Item>
                  <Descriptions.Item label="Giá thuê">{formatCurrency(detailHostel.price)}/tháng</Descriptions.Item>
                  <Descriptions.Item label="Đặt cọc">{detailHostel.depositAmount ? formatCurrency(detailHostel.depositAmount) : 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Tiện nghi">{detailHostel.amenities || 'N/A'}</Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Card 2: Thông tin liên hệ */}
              <Card className="mb-4" title="Thông tin liên hệ chủ nhà" size="small">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Tên liên hệ">{detailHostel.contactName}</Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">{detailHostel.contactPhone}</Descriptions.Item>
                  <Descriptions.Item label="Email">{detailHostel.contactEmail || 'N/A'}</Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Card 3: Thông tin khách hàng */}
              <Card className="mb-4" title="Thông tin khách hàng" size="small">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Họ tên">{detailBooking.customerName}</Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">{detailBooking.customerPhone}</Descriptions.Item>
                  <Descriptions.Item label="Email">{detailBooking.customerEmail || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Ngày đặt">{formatDate(detailBooking.bookingDate)}</Descriptions.Item>
                  <Descriptions.Item label="Ngày nhận phòng">{formatDate(detailBooking.checkInDate)}</Descriptions.Item>
                  <Descriptions.Item label="Tiền đặt cọc">{formatCurrency(detailBooking.depositAmount)}</Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Card 4: Thông tin hợp đồng */}
              <Card className="mb-4" title="Thông tin hợp đồng" size="small">
                <Descriptions column={2} size="small" bordered>
                  <Descriptions.Item label="Mã hợp đồng" span={2}>
                    <strong>#{selectedContract.contractId}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày bắt đầu">{formatDate(selectedContract.startDate)}</Descriptions.Item>
                  <Descriptions.Item label="Ngày kết thúc">{formatDate(selectedContract.endDate)}</Descriptions.Item>
                  <Descriptions.Item label="Tiền thuê/tháng">
                    <strong className="text-blue-600">{formatCurrency(selectedContract.monthlyRent)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiền đặt cọc">
                    <strong className="text-orange-600">{formatCurrency(selectedContract.depositAmount)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá điện">
                    {selectedContract.electricityCostPerUnit ? `${selectedContract.electricityCostPerUnit} VNĐ/kWh` : 'Chưa cập nhật'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá nước">
                    {selectedContract.waterCostPerUnit ? `${selectedContract.waterCostPerUnit} VNĐ/m³` : 'Chưa cập nhật'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phí dịch vụ">
                    {selectedContract.serviceFee ? formatCurrency(selectedContract.serviceFee) : 'Không'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chu kỳ thanh toán">
                    {selectedContract.paymentCycle === 'MONTHLY' ? 'Hàng tháng' : selectedContract.paymentCycle === 'QUARTERLY' ? 'Hàng quý' : 'Hàng năm'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số người ở">{selectedContract.numberOfTenants} người</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={getStatusColor(selectedContract.status)}>{getStatusText(selectedContract.status)}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Điều khoản hợp đồng */}
              {selectedContract.terms && (
                <Card className="mb-4" title="Điều khoản hợp đồng" size="small">
                  <p className="text-sm whitespace-pre-line">{selectedContract.terms}</p>
                </Card>
              )}

              {/* Ghi chú */}
              {selectedContract.notes && (
                <Card title="Ghi chú" size="small">
                  <p className="text-sm whitespace-pre-line">{selectedContract.notes}</p>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">Không có thông tin</div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};
