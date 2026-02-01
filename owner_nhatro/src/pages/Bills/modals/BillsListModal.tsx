import React from 'react';
import { Modal, Table, Tag, Button, Space } from 'antd';
import { PlusOutlined, DollarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Bill } from '@/types/bill.types';
import { useBillsStore } from '@/store/useBillsStore';

interface BillsListModalProps {
  roomCode: string;
  roomName: string;
  onCreateBill: () => void;
}

export const BillsListModal: React.FC<BillsListModalProps> = ({ 
  roomCode, 
  roomName,
  onCreateBill 
}) => {
  const { 
    bills, 
    loading, 
    billsModalOpen, 
    closeBillsModal, 
    openPaymentModal 
  } = useBillsStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'green';
      case 'UNPAID':
        return 'orange';
      case 'OVERDUE':
        return 'red';
      case 'PENDING':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'UNPAID':
        return 'Chưa thanh toán';
      case 'OVERDUE':
        return 'Quá hạn';
      case 'PENDING':
        return 'Chờ xử lý';
      default:
        return status;
    }
  };

  const columns: ColumnsType<Bill> = [
    { title: 'Mã HĐ', dataIndex: 'billId', key: 'billId', width: 80 },
    {
      title: 'Tháng/Năm',
      key: 'period',
      width: 120,
      render: (_, record) => `${record.billingMonth}/${record.billingYear}`,
    },
    { 
      title: 'Người thuê', 
      key: 'tenant',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.tenantName}</div>
          <div className="text-xs text-gray-500">{record.tenantPhone}</div>
        </div>
      ),
    },
    { 
      title: 'Tiền phòng', 
      dataIndex: 'roomPrice', 
      key: 'roomPrice', 
      render: (val) => formatCurrency(val),
      width: 120,
    },
    { 
      title: 'Điện', 
      dataIndex: 'electricityCost', 
      key: 'electricityCost', 
      render: (val) => formatCurrency(val),
      width: 100,
    },
    { 
      title: 'Nước', 
      dataIndex: 'waterCost', 
      key: 'waterCost', 
      render: (val) => formatCurrency(val),
      width: 100,
    },
    { 
      title: 'Dịch vụ', 
      dataIndex: 'serviceCost', 
      key: 'serviceCost', 
      render: (val) => formatCurrency(val),
      width: 110,
    },
    { 
      title: 'Tổng tiền', 
      dataIndex: 'totalAmount', 
      key: 'totalAmount', 
      render: (val) => <span className="font-bold text-indigo-600">{formatCurrency(val)}</span>,
      width: 130,
    },
    {
      title: 'Hạn TT',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 110,
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {record.status !== 'PAID' && (
            <Button
              size="small"
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => openPaymentModal(record)}
            >
              Thanh toán
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={`Hóa đơn phòng ${roomName}`}
      open={billsModalOpen}
      onCancel={closeBillsModal}
      footer={null}
      width={1400}
    >
      <div className="mb-4 flex justify-between items-center">
        <span className="text-gray-500">{bills.length} hóa đơn</span>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreateBill}
          size="small"
        >
          Thêm hóa đơn
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={bills}
        rowKey="billId"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1300 }}
      />
    </Modal>
  );
};
