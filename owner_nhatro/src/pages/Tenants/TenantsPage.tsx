// Bookings page - Quản lý đặt trọ
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { bookingService } from '@/services/api/booking.service';
import { contractService } from '@/services/api/contract.service';
import { Button, Modal, Alert, Table, Tag, Card, Space, Descriptions, Input } from 'antd';
import { SearchOutlined, ReloadOutlined, ArrowRightOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Booking } from '@/types/booking.types';

export const TenantsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [bookingsWithContracts, setBookingsWithContracts] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookingService.getOwnerBookings();
      setBookings(data);
      setIsSearching(false);
      
      // Check which bookings have contracts
      await checkBookingsContracts(data);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách đặt trọ');
    } finally {
      setLoading(false);
    }
  };

  const checkBookingsContracts = async (bookingsList: Booking[]) => {
    const contractChecks = await Promise.all(
      bookingsList.map(async (booking) => {
        try {
          const contract = await contractService.getContractByBookingId(booking.bookingId);
          return contract ? booking.bookingId : null;
        } catch {
          return null;
        }
      })
    );
    
    const bookingIdsWithContracts = contractChecks.filter((id): id is number => id !== null);
    setBookingsWithContracts(new Set(bookingIdsWithContracts));
  };

  const handleSearch = async () => {
    if (!searchPhone.trim()) {
      Modal.warning({
        title: 'Thông báo',
        content: 'Vui lòng nhập số điện thoại để tìm kiếm!',
      });
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await bookingService.searchBookingsByPhone(searchPhone.trim());
      setBookings(data);
      setIsSearching(true);
      
      // Check contracts for search results
      await checkBookingsContracts(data);
      
      if (data.length === 0) {
        Modal.info({
          title: 'Kết quả tìm kiếm',
          content: 'Không tìm thấy booking nào với số điện thoại này.',
        });
      }
    } catch (err: any) {
      console.error('Error searching bookings:', err);
      setError(err?.response?.data?.message || 'Không thể tìm kiếm booking');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchPhone('');
    setIsSearching(false);
    fetchBookings();
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'gold',
      'confirmed': 'blue',
      'completed': 'green',
      'cancelled': 'red',
    };
    return statusMap[status.toLowerCase()] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap: Record<string, string> = {
      'CASH': 'Tiền mặt',
      'BANKING': 'Chuyển khoản ngân hàng',
      'MOMO': 'Ví MoMo',
      'VNPAY': 'Ví VNPay',
    };
    return methodMap[method] || method;
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ thanh toán',
      'COMPLETED': 'Đã thanh toán',
      'FAILED': 'Thất bại',
      'REFUNDED': 'Đã hoàn tiền',
    };
    return statusMap[status] || status;
  };

  const handleViewDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailModalOpen(true);
  };

  const handleUpdateStatus = (bookingId: number, status: string) => {
    Modal.confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc chắn muốn chuyển trạng thái sang "${getStatusText(status)}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await bookingService.updateStatusBooking(bookingId, status.toUpperCase());
          Modal.success({
            content: 'Cập nhật trạng thái thành công!',
          });
          fetchBookings();
        } catch (err: any) {
          Modal.error({
            title: 'Cập nhật thất bại',
            content: err?.response?.data?.message || err.message,
          });
        }
      },
    });
  };

  const handleCancelBooking = (bookingId: number) => {
    Modal.confirm({
      title: 'Xác nhận hủy booking',
      content: 'Bạn có chắc chắn muốn hủy booking này? Hành động này không thể hoàn tác.',
      okText: 'Xác nhận hủy',
      cancelText: 'Đóng',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await bookingService.cancelBooking(bookingId);
          Modal.success({
            content: 'Hủy booking thành công!',
          });
          fetchBookings();
        } catch (err: any) {
          Modal.error({
            title: 'Hủy booking thất bại',
            content: err?.response?.data?.message || err.message,
          });
        }
      },
    });
  };

  

  const columns: ColumnsType<Booking> = [
    {
      title: 'Mã booking',
      dataIndex: 'bookingId',
      key: 'bookingId',
      width: 100,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.customerName}</div>
          <div className="text-xs text-gray-500">{record.customerPhone}</div>
        </div>
      ),
    },
    {
      title: 'Phòng trọ',
      key: 'hostel',
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.hostelName}</div>
          <div className="text-xs text-gray-500">{record.hostelAddress}</div>
        </div>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
      render: (date) => formatDate(date),
      width: 150,
    },
    {
      title: 'Ngày nhận phòng',
      dataIndex: 'checkInDate',
      key: 'checkInDate',
      render: (date) => formatDate(date),
      width: 150,
    },
    {
      title: 'Tiền đặt cọc',
      dataIndex: 'depositAmount',
      key: 'depositAmount',
      render: (amount) => (
        <span className="font-semibold text-indigo-600">{formatCurrency(amount)}</span>
      ),
      width: 130,
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
      width: 320,
      render: (_, record) => {
        const hasContract = bookingsWithContracts.has(record.bookingId);
        
        return (
          <Space size="small">
            <Button size="small" type="link" onClick={() => handleViewDetail(record)}>
              Chi tiết
            </Button>
            {record.status.toUpperCase() === 'PENDING' && (
              <Button
                size="small"
                type="primary"
                onClick={() => handleUpdateStatus(record.bookingId, 'CONFIRMED')}
              >
                Xác nhận
              </Button>
            )}
            {record.status.toUpperCase() === 'CONFIRMED' && (
              <>
                {hasContract ? (
                  <Tag color="green">Hợp đồng đã tạo</Tag>
                ) : (
                  <Button
                    size="small"
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={() => navigate(`/contracts?bookingId=${record.bookingId}`)}
                  >
                    Tạo hợp đồng
                  </Button>
                )}
              </>
            )}
            {(record.status.toUpperCase() === 'PENDING' || record.status.toUpperCase() === 'CONFIRMED') && !hasContract && (
              <Button
                size="small"
                danger
                onClick={() => handleCancelBooking(record.bookingId)}
              >
                Hủy
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <MainLayout>
      <div className="bookings-page">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đặt trọ</h1>
        </div>

        {/* Search Section */}
        <Card className="mb-4">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Nhập số điện thoại khách hàng"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              allowClear
            />
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={loading}
            >
              Tìm kiếm
            </Button>
            {isSearching && (
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                Hiển thị tất cả
              </Button>
            )}
            {isSearching && (
              <span className="text-sm text-gray-500">
                Đang lọc theo SĐT: <strong>{searchPhone}</strong>
              </span>
            )}
          </div>
        </Card>

        {error && (
          <Alert message={error} type="error" showIcon className="mb-4" />
        )}

        <Card>
          <Table
            columns={columns}
            dataSource={bookings}
            rowKey="bookingId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} booking`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Modal Chi tiết booking */}
        <Modal
          title="Chi tiết booking"
          open={detailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalOpen(false)}>
              Đóng
            </Button>,
            selectedBooking?.status.toUpperCase() === 'PENDING' && (
              <Button
                key="confirm"
                type="primary"
                onClick={() => {
                  handleUpdateStatus(selectedBooking.bookingId, 'CONFIRMED');
                  setDetailModalOpen(false);
                }}
              >
                Xác nhận booking
              </Button>
            ),
          ]}
          width={700}
        >
          {selectedBooking && (
            <div>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Mã booking">
                  {selectedBooking.bookingId}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(selectedBooking.status)}>
                    {getStatusText(selectedBooking.status)}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              <Card className="mt-4" title="Thông tin khách hàng" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Tên khách hàng">
                    {selectedBooking.customerName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {selectedBooking.customerPhone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {selectedBooking.customerEmail}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card className="mt-4" title="Thông tin phòng trọ" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Tên phòng trọ">
                    {selectedBooking.hostelName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    {selectedBooking.hostelAddress}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card className="mt-4" title="Thông tin booking" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Ngày đặt">
                    {formatDate(selectedBooking.bookingDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày nhận phòng">
                    {formatDate(selectedBooking.checkInDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiền đặt cọc">
                    <span className="font-semibold text-indigo-600">
                      {formatCurrency(selectedBooking.depositAmount)}
                    </span>
                  </Descriptions.Item>
                  {selectedBooking.notes && (
                    <Descriptions.Item label="Ghi chú">
                      {selectedBooking.notes}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Ngày tạo">
                    {formatDate(selectedBooking.createdAt)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {selectedBooking.payment && (
                <Card className="mt-4" title="Thông tin thanh toán" size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Số tiền">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(selectedBooking.payment.amount)}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức">
                      {getPaymentMethodText(selectedBooking.payment.paymentMethod)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày thanh toán">
                      {formatDate(selectedBooking.payment.paidAt)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag color={selectedBooking.payment.status === 'COMPLETED' ? 'green' : selectedBooking.payment.status === 'FAILED' ? 'red' : selectedBooking.payment.status === 'REFUNDED' ? 'purple' : 'orange'}>
                        {getPaymentStatusText(selectedBooking.payment.status)}
                      </Tag>
                    </Descriptions.Item>
                    {selectedBooking.payment.transactionId && (
                      <Descriptions.Item label="Mã giao dịch">
                        {selectedBooking.payment.transactionId}
                      </Descriptions.Item>
                    )}
                    {selectedBooking.payment.note && (
                      <Descriptions.Item label="Ghi chú thanh toán">
                        {selectedBooking.payment.note}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              )}
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};
