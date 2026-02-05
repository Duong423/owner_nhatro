// Payments page
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { useBillsStore } from '@/store/useBillsStore';
import { Table, Tag, Space, Button, Card, Descriptions, Modal, Spin } from 'antd';
import type { Bill } from '@/types/bill.types';
import { formatCurrency } from '@/utils/helpers/formatters';

export const PaymentsPage = () => {
  const { ownerBills, loading, fetchOwnerBills } = useBillsStore();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchOwnerBills();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'UNPAID': return 'default';
      case 'PENDING': return 'processing';
      case 'OVERDUE': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Đã thanh toán';
      case 'UNPAID': return 'Chưa thanh toán';
      case 'PENDING': return 'Đang xử lý';
      case 'OVERDUE': return 'Quá hạn';
      default: return status;
    }
  };

  const handleViewDetail = (bill: Bill) => {
    setSelectedBill(bill);
    setDetailModalOpen(true);
  };

  const columns = [
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
      render: (_: any, record: Bill) => (
        <div>
          <div className="font-semibold">{record.tenantName}</div>
          <div className="text-gray-500 text-sm">{record.tenantPhone}</div>
        </div>
      ),
    },
    {
      title: 'Kỳ hóa đơn',
      key: 'period',
      width: 120,
      render: (_: any, record: Bill) => `${record.billingMonth}/${record.billingYear}`,
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Hạn thanh toán',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 120,
      render: (date: string | null) => 
        date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Bill) => (
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
          <h1 className="text-2xl font-bold">Quản lý thanh toán</h1>
          <p className="text-gray-600">Danh sách tất cả hóa đơn của chủ trọ</p>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={ownerBills}
            rowKey="billId"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} hóa đơn`,
            }}
          />
        </Card>

        {/* Bill Detail Modal */}
        <Modal
          title="Chi tiết hóa đơn"
          open={detailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {selectedBill && (
            <div className="space-y-4">
              {/* Thông tin khách hàng */}
              <Card title="Thông tin khách hàng" size="small">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Họ tên">{selectedBill.tenantName}</Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">{selectedBill.tenantPhone}</Descriptions.Item>
                  <Descriptions.Item label="Mã khách hàng" span={2}>{selectedBill.tenantId}</Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Thông tin hóa đơn */}
              <Card title="Thông tin hóa đơn" size="small">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Mã hóa đơn">{selectedBill.billId}</Descriptions.Item>
                  <Descriptions.Item label="Mã hợp đồng">{selectedBill.contractId}</Descriptions.Item>
                  <Descriptions.Item label="Phòng">{selectedBill.roomCode}</Descriptions.Item>
                  <Descriptions.Item label="Kỳ hóa đơn">
                    {selectedBill.billingMonth}/{selectedBill.billingYear}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={getStatusColor(selectedBill.status)}>
                      {getStatusText(selectedBill.status)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Hạn thanh toán">
                    {new Date(selectedBill.dueDate).toLocaleDateString('vi-VN')}
                  </Descriptions.Item>
                  {selectedBill.paymentDate && (
                    <Descriptions.Item label="Ngày thanh toán" span={2}>
                      {new Date(selectedBill.paymentDate).toLocaleDateString('vi-VN')}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* Chi tiết chi phí */}
              <Card title="Chi tiết chi phí" size="small">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Tiền phòng">
                    <span className="font-semibold">{formatCurrency(selectedBill.roomPrice)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiền điện">
                    <span className="font-semibold">{formatCurrency(selectedBill.electricityCost)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiền nước">
                    <span className="font-semibold">{formatCurrency(selectedBill.waterCost)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiền dịch vụ">
                    <span className="font-semibold">{formatCurrency(selectedBill.serviceCost)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng cộng">
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(selectedBill.totalAmount)}
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Thông tin thanh toán */}
              {selectedBill.status === 'PAID' && (
                <Card title="Thông tin thanh toán" size="small">
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Phương thức">
                      {selectedBill.paymentMethod || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã giao dịch">
                      {selectedBill.transactionCode || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}

              {/* Ghi chú */}
              {selectedBill.note && (
                <Card title="Ghi chú" size="small">
                  <p>{selectedBill.note}</p>
                </Card>
              )}

              {/* Thông tin chủ trọ */}
              <Card title="Thông tin chủ trọ" size="small">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Họ tên">{selectedBill.ownerName}</Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">{selectedBill.ownerPhone}</Descriptions.Item>
                </Descriptions>
              </Card>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};
