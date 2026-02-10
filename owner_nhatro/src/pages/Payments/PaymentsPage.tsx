// Payments page
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { billService } from '@/services/api/bill.service';
import { Table, Tag, Space, Button, Card, Descriptions, Modal, Select, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { PaymentHistory } from '@/types/payment.types';
import { formatCurrency } from '@/utils/helpers/formatters';

const currentDate = new Date();
const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tháng ${i + 1}`,
}));

const yearOptions = Array.from({ length: 5 }, (_, i) => {
  const y = currentDate.getFullYear() - 2 + i;
  return { value: y, label: `${y}` };
});

export const PaymentsPage = () => {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState<number>(currentDate.getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(currentDate.getFullYear());

  useEffect(() => {
    fetchByMonth(filterMonth, filterYear);
  }, []);

  const fetchAllPayments = async () => {
    setLoading(true);
    try {
      const data = await billService.getPaymentHistory();
      setPayments(data);
    } catch (err) {
      console.error('Error fetching payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchByMonth = async (month: number, year: number) => {
    setLoading(true);
    try {
      const data = await billService.getPaymentHistoryByMonth(month, year);
      setPayments(data);
    } catch (err) {
      console.error('Error fetching monthly payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchByMonth(filterMonth, filterYear);
  };

  const handleShowAll = () => {
    fetchAllPayments();
  };

  const handleViewDetail = (payment: PaymentHistory) => {
    setSelectedPayment(payment);
    setDetailModalOpen(true);
  };

  const getPaymentMethodText = (method: string | null) => {
    switch (method) {
      case 'CASH': return 'Tiền mặt';
      case 'ZALO_PAY': return 'ZaloPay';
      case 'MOMO': return 'MoMo';
      case 'BANK_TRANSFER': return 'Chuyển khoản';
      default: return method || '-';
    }
  };

  const columns = [
    {
      title: 'Mã TT',
      dataIndex: 'paymentHistoryId',
      key: 'paymentHistoryId',
      width: 80,
    },
    {
      title: 'Mã hóa đơn',
      dataIndex: 'billId',
      key: 'billId',
      width: 100,
    },
    {
      title: 'Phòng',
      dataIndex: 'roomCode',
      key: 'roomCode',
      width: 100,
    },
    {
      title: 'Khách hàng',
      key: 'tenant',
      width: 200,
      render: (_: any, record: PaymentHistory) => (
        <div>
          <div className="font-semibold">{record.tenantName}</div>
          <div className="text-gray-500 text-sm">{record.tenantPhone}</div>
        </div>
      ),
    },
    {
      title: 'Kỳ',
      key: 'period',
      width: 100,
      render: (_: any, record: PaymentHistory) => `${record.billingMonth}/${record.billingYear}`,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      render: (amount: number) => (
        <span className="font-semibold text-blue-600">
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 130,
      render: (method: string | null) => (
        <Tag color="green">{getPaymentMethodText(method)}</Tag>
      ),
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 140,
      render: (date: string | null) =>
        date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: PaymentHistory) => (
        <Button
          type="link"
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Lịch sử thanh toán</h1>
          <p className="text-gray-600">Danh sách lịch sử thanh toán</p>
        </div>

        {/* Filter */}
        <Card className="mb-4">
          <Row gutter={[12, 12]} align="middle">
            <Col>
              <span className="font-medium mr-2">Tháng:</span>
              <Select
                value={filterMonth}
                onChange={(val) => setFilterMonth(val)}
                options={monthOptions}
                style={{ width: 120 }}
              />
            </Col>
            <Col>
              <span className="font-medium mr-2">Năm:</span>
              <Select
                value={filterYear}
                onChange={(val) => setFilterYear(val)}
                options={yearOptions}
                style={{ width: 100 }}
              />
            </Col>
            <Col>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleFilter}>
                  Lọc
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleShowAll}>
                  Tất cả
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={payments}
            rowKey="paymentHistoryId"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} giao dịch`,
            }}
          />
        </Card>

        {/* Payment Detail Modal */}
        <Modal
          title="Chi tiết thanh toán"
          open={detailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {selectedPayment && (
            <div className="space-y-4">
              {/* Thông tin khách hàng */}
              <Card title="Thông tin khách hàng" size="small">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Họ tên">{selectedPayment.tenantName}</Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">{selectedPayment.tenantPhone}</Descriptions.Item>
                  <Descriptions.Item label="Mã khách hàng" span={2}>{selectedPayment.tenantId}</Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Thông tin hóa đơn */}
              <Card title="Thông tin hóa đơn" size="small">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Mã thanh toán">{selectedPayment.paymentHistoryId}</Descriptions.Item>
                  <Descriptions.Item label="Mã hóa đơn">{selectedPayment.billId}</Descriptions.Item>
                  <Descriptions.Item label="Mã hợp đồng">{selectedPayment.contractId}</Descriptions.Item>
                  <Descriptions.Item label="Phòng">{selectedPayment.roomCode}</Descriptions.Item>
                  <Descriptions.Item label="Kỳ hóa đơn">
                    {selectedPayment.billingMonth}/{selectedPayment.billingYear}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hạn thanh toán">
                    {selectedPayment.dueDate ? new Date(selectedPayment.dueDate).toLocaleDateString('vi-VN') : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày thanh toán" span={2}>
                    {selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleString('vi-VN') : '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Chi tiết chi phí */}
              <Card title="Chi tiết chi phí" size="small">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Tiền phòng">
                    <span className="font-semibold">{formatCurrency(selectedPayment.roomPrice)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiền điện">
                    <span className="font-semibold">{formatCurrency(selectedPayment.electricityCost)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiền nước">
                    <span className="font-semibold">{formatCurrency(selectedPayment.waterCost)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiền dịch vụ">
                    <span className="font-semibold">{formatCurrency(selectedPayment.serviceCost)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng cộng">
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(selectedPayment.totalAmount)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Thông tin thanh toán */}
              <Card title="Thông tin thanh toán" size="small">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Phương thức">
                    {getPaymentMethodText(selectedPayment.paymentMethod)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã giao dịch">
                    {selectedPayment.transactionCode || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Ghi chú */}
              {selectedPayment.note && (
                <Card title="Ghi chú" size="small">
                  <p>{selectedPayment.note}</p>
                </Card>
              )}

              {/* Thông tin chủ trọ */}
              <Card title="Thông tin chủ trọ" size="small">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Họ tên">{selectedPayment.ownerName}</Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">{selectedPayment.ownerPhone}</Descriptions.Item>
                </Descriptions>
              </Card>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};
