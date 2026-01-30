import React from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Button, Alert, Table, Tag, Card, Space, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Contract } from '@/types/contract.types';
import { useContractsStore } from '@/store/useContractsStore';
import CreateContractModal from './modals/CreateContractModal';
import ContractDetailModal from './modals/ContractDetailModal';
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '@/pages/Contracts/helpers';

export const ContractsPage: React.FC = () => {
  const { contracts, loading, error, fetchContracts, setSelectedContract, setDetailModalOpen, signContract, terminateContract, isCreateMode } = useContractsStore();

  React.useEffect(() => { fetchContracts(); }, [fetchContracts]);

  // If we are in create mode, show only the create contract page/modal and hide the list/details
  if (isCreateMode) {
    return <CreateContractModal />;
  }

  const columns: ColumnsType<Contract> = [
    { title: 'Mã HĐ', dataIndex: 'contractId', key: 'contractId', width: 80 },
    { title: 'Người thuê', dataIndex: 'tenantName', key: 'tenantName', render: (name, record) => (<div><div className="font-semibold">{name}</div><div className="text-xs text-gray-500">{record.phoneNumberTenant}</div></div>) },
    { title: 'Phòng trọ', dataIndex: 'hostelName', key: 'hostelName', render: (name, record) => (<div><div className="font-semibold">{name}</div><div className="text-xs text-gray-500">{record.hostelAddress}</div></div>), width: 200 },
    { title: 'Tiền thuê', dataIndex: 'monthlyRent', key: 'monthlyRent', render: (amount) => (<span className="font-semibold text-indigo-600">{formatCurrency(amount)}</span>), width: 130 },
    { title: 'Thời hạn', key: 'duration', render: (_, record) => (<div className="text-sm"><div>{formatDate(record.startDate)}</div><div className="text-gray-500">đến {formatDate(record.endDate)}</div></div>), width: 120 },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => (<Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>), width: 120 },
    {
      title: 'Hành động', key: 'action', width: 250, render: (_, record) => (
        <Space size="small">
          <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => { setSelectedContract(record); setDetailModalOpen(true); }}>Xem</Button>
          {record.status === 'PENDING' && (
            <>
              <Button size="small" type="primary" onClick={() => {
                Modal.confirm({ title: 'Xác nhận ký hợp đồng', content: 'Bạn có chắc chắn muốn ký hợp đồng này?', okText: 'Xác nhận ký', cancelText: 'Hủy', onOk: async () => {
                  try { await signContract(record.contractId); Modal.success({ content: 'Ký hợp đồng thành công!' }); } catch (err: any) { Modal.error({ title: 'Ký hợp đồng thất bại', content: err?.response?.data?.message || err.message }); }
                } });
              }}>Ký hợp đồng</Button>
              <Button size="small" danger onClick={() => {
                Modal.confirm({ title: 'Xác nhận chấm dứt hợp đồng', content: 'Bạn có chắc chắn muốn chấm dứt hợp đồng này?', okText: 'Xác nhận', cancelText: 'Hủy', okButtonProps: { danger: true }, onOk: async () => {
                  try { await terminateContract(record.contractId); Modal.success({ content: 'Chấm dứt hợp đồng thành công!' }); } catch (err: any) { Modal.error({ title: 'Chấm dứt hợp đồng thất bại', content: err?.response?.data?.message || err.message }); }
                } });
              }}>Hủy</Button>
            </>
          )}
          {record.status === 'ACTIVE' && (
            <Button size="small" danger onClick={() => {
              Modal.confirm({ title: 'Xác nhận chấm dứt hợp đồng', content: 'Bạn có chắc chắn muốn chấm dứt hợp đồng này?', okText: 'Xác nhận', cancelText: 'Hủy', okButtonProps: { danger: true }, onOk: async () => {
                try { await terminateContract(record.contractId); Modal.success({ content: 'Chấm dứt hợp đồng thành công!' }); } catch (err: any) { Modal.error({ title: 'Chấm dứt hợp đồng thất bại', content: err?.response?.data?.message || err.message }); }
              } });
            }}>Chấm dứt</Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="contracts-page">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý hợp đồng</h1>
        </div>

        {error && <Alert message={error} type="error" showIcon className="mb-4" />}

        <Card>
          <Table columns={columns} dataSource={contracts} rowKey="contractId" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} hợp đồng` }} />
        </Card>

        <CreateContractModal />
        <ContractDetailModal />
      </div>
    </MainLayout>
  );
};

export default ContractsPage;
