import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Card, Descriptions, Button, Tag } from 'antd';
import dayjs from 'dayjs';
import { useContractsStore } from '@/store/useContractsStore';
import { getStatusColor, getStatusText, formatCurrency, formatDate } from '@/pages/Contracts/helpers';
import { contractService } from '@/services/api/contract.service';

export const ContractDetailModal: React.FC = () => {
  const { selectedContract, detailModalOpen, setDetailModalOpen, updateContract } = useContractsStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm] = Form.useForm();
  const [pdfLoading, setPdfLoading] = useState(false);

  const handlePrintPdf = async () => {
    if (!selectedContract) return;
    try {
      setPdfLoading(true);
      const blob: Blob = await contractService.getContractPdf(selectedContract.contractId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contract-${selectedContract.contractId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      Modal.error({ title: 'Lỗi tải file', content: err?.response?.data?.message || err?.message || String(err) });
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    if (!detailModalOpen) setIsEditMode(false);
  }, [detailModalOpen]);

  useEffect(() => {
    if (isEditMode && selectedContract) {
      editForm.resetFields();
      editForm.setFieldsValue({
        ownerName: selectedContract.ownerName,
        phoneNumberOwner: selectedContract.phoneNumberOwner,
        tenantName: selectedContract.tenantName,
        phoneNumberTenant: selectedContract.phoneNumberTenant,
        cccd: selectedContract.cccd || '',
        tenantEmail: selectedContract.tenantEmail,
        startDate: selectedContract.startDate ? dayjs(selectedContract.startDate) : null,
        endDate: selectedContract.endDate ? dayjs(selectedContract.endDate) : null,
        monthlyRent: selectedContract.monthlyRent,
        depositAmount: selectedContract.depositAmount,
        electricityCostPerUnit: selectedContract.electricityCostPerUnit,
        waterCostPerUnit: selectedContract.waterCostPerUnit,
        serviceFee: selectedContract.serviceFee,
        paymentCycle: selectedContract.paymentCycle,
        numberOfTenants: selectedContract.numberOfTenants,
        terms: selectedContract.terms,
        notes: selectedContract.notes,
      });
    }
  }, [isEditMode, selectedContract, editForm]);

  if (!selectedContract) return null;

  return (
    <Modal open={detailModalOpen} onCancel={() => { setDetailModalOpen(false); setIsEditMode(false); editForm.resetFields(); }} footer={null} title="Chi tiết hợp đồng" width={900}>
      {isEditMode ? (
        <Form form={editForm} layout="vertical" onFinish={async (values) => {
          try {
            const dto = {
              ...values,
              startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
              endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
            };
            await updateContract(selectedContract.contractId, dto);
            Modal.success({ title: 'Cập nhật thành công', onOk: () => setIsEditMode(false) });
          } catch (err: any) {
            Modal.error({ title: 'Cập nhật thất bại', content: err?.response?.data?.message || err?.message || String(err) });
          }
        }}>
          <Card className="mb-4" title="Chỉnh sửa hợp đồng" size="small">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Tên chủ nhà" name="ownerName" rules={[{ required: true }]}>{<Input />}</Form.Item>
              <Form.Item label="Số điện thoại chủ nhà" name="phoneNumberOwner" rules={[{ required: true }, { pattern: /^[0-9]{10}$/ }]}>{<Input />}</Form.Item>
              <Form.Item label="Họ tên người thuê" name="tenantName" rules={[{ required: true }]}>{<Input />}</Form.Item>
              <Form.Item label="Số điện thoại người thuê" name="phoneNumberTenant" rules={[{ required: true }, { pattern: /^[0-9]{10}$/ }]}>{<Input />}</Form.Item>
              <Form.Item label="CCCD/CMND" name="cccd" rules={[{ pattern: /^[0-9]{9,12}$/, message: 'CCCD không hợp lệ' }]}>{<Input />}</Form.Item>
              <Form.Item label="Email người thuê" name="tenantEmail" rules={[{ type: 'email' }]}>{<Input />}</Form.Item>
              <Form.Item label="Ngày bắt đầu" name="startDate" rules={[{ required: true }]}>{<DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />}</Form.Item>
              <Form.Item label="Ngày kết thúc" name="endDate" rules={[{ required: true }]}>{<DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />}</Form.Item>
              <Form.Item label="Tiền thuê/tháng" name="monthlyRent" rules={[{ required: true }]}>{<InputNumber style={{ width: '100%' }} />}</Form.Item>
              <Form.Item label="Tiền đặt cọc" name="depositAmount" rules={[{ required: true }]}>{<InputNumber style={{ width: '100%' }} />}</Form.Item>
              <Form.Item label="Giá điện" name="electricityCostPerUnit" rules={[{ required: true }]}>{<InputNumber style={{ width: '100%' }} />}</Form.Item>
              <Form.Item label="Giá nước" name="waterCostPerUnit" rules={[{ required: true }]}>{<InputNumber style={{ width: '100%' }} />}</Form.Item>
              <Form.Item label="Phí dịch vụ" name="serviceFee" rules={[{ required: true }]}>{<InputNumber style={{ width: '100%' }} />}</Form.Item>
              <Form.Item label="Chu kỳ thanh toán" name="paymentCycle" rules={[{ required: true }]}>{<Select><Select.Option value="MONTHLY">Hàng tháng</Select.Option><Select.Option value="QUARTERLY">Hàng quý</Select.Option><Select.Option value="YEARLY">Hàng năm</Select.Option></Select>}</Form.Item>
              <Form.Item label="Số người ở" name="numberOfTenants" rules={[{ required: true }]}>{<InputNumber style={{ width: '100%' }} min={1} />}</Form.Item>
            </div>
            <Form.Item label="Điều khoản hợp đồng" name="terms">{<Input.TextArea rows={4} />}</Form.Item>
            <Form.Item label="Ghi chú" name="notes">{<Input.TextArea rows={2} />}</Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => { setIsEditMode(false); editForm.resetFields(); }}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu</Button>
            </div>
          </Card>
        </Form>
      ) : (
        <div>
          <Card className="mb-4" title="Thông tin nhà trọ" size="small">
            <Descriptions size="small" bordered>
              <Descriptions.Item label="Tên nhà trọ">{selectedContract.hostelName}</Descriptions.Item>
              <Descriptions.Item label="Mã phòng">{selectedContract.hostelRoomCode || selectedContract.roomCode || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>{selectedContract.hostelAddress}</Descriptions.Item>
              <Descriptions.Item label="Giá thuê">{formatCurrency(selectedContract.hostelPrice)}</Descriptions.Item>
              <Descriptions.Item label="Diện tích">{selectedContract.hostelArea}m²</Descriptions.Item>
              <Descriptions.Item label="Tiện nghi" span={2}>{Array.isArray(selectedContract.hostelAmenities) ? (selectedContract.hostelAmenities.length > 0 ? selectedContract.hostelAmenities.join(', ') : 'N/A') : (typeof selectedContract.hostelAmenities === 'string' && selectedContract.hostelAmenities.trim() !== '' ? selectedContract.hostelAmenities : 'N/A')}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className="mb-4" title="Bên A - Thông tin chủ nhà" size="small">
            <Descriptions size="small" bordered>
              <Descriptions.Item label="Tên chủ nhà">{selectedContract.ownerName}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedContract.phoneNumberOwner}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className="mb-4" title="Bên B - Thông tin người thuê" size="small">
            <Descriptions size="small" bordered>
              <Descriptions.Item label="Họ tên">{selectedContract.tenantName}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedContract.phoneNumberTenant}</Descriptions.Item>
              <Descriptions.Item label="CCCD">{selectedContract.cccd || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedContract.tenantEmail || 'N/A'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className="mb-4" title="Thông tin hợp đồng" size="small">
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Mã hợp đồng" span={2}><strong>#{selectedContract.contractId}</strong></Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu">{formatDate(selectedContract.startDate)}</Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc">{formatDate(selectedContract.endDate)}</Descriptions.Item>
              <Descriptions.Item label="Tiền thuê/tháng"><strong className="text-blue-600">{formatCurrency(selectedContract.monthlyRent)}</strong></Descriptions.Item>
              <Descriptions.Item label="Tiền đặt cọc"><strong className="text-orange-600">{formatCurrency(selectedContract.depositAmount)}</strong></Descriptions.Item>
              <Descriptions.Item label="Giá điện">{selectedContract.electricityCostPerUnit ? `${selectedContract.electricityCostPerUnit} VNĐ/kWh` : 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Giá nước">{selectedContract.waterCostPerUnit ? `${selectedContract.waterCostPerUnit} VNĐ/m³` : 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Phí dịch vụ">{selectedContract.serviceFee ? formatCurrency(selectedContract.serviceFee) : 'Không'}</Descriptions.Item>
              <Descriptions.Item label="Chu kỳ thanh toán">{selectedContract.paymentCycle === 'MONTHLY' ? 'Hàng tháng' : selectedContract.paymentCycle === 'QUARTERLY' ? 'Hàng quý' : 'Hàng năm'}</Descriptions.Item>
              <Descriptions.Item label="Số người ở">{selectedContract.numberOfTenants} người</Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><Tag color={getStatusColor(selectedContract.status)}>{getStatusText(selectedContract.status)}</Tag></Descriptions.Item>
            </Descriptions>
          </Card>

          {selectedContract.terms && (<Card className="mb-4" title="Điều khoản hợp đồng" size="small"><p className="text-sm whitespace-pre-line">{selectedContract.terms}</p></Card>)}
          {selectedContract.notes && (<Card title="Ghi chú" size="small"><p className="text-sm whitespace-pre-line">{selectedContract.notes}</p></Card>)}

          {/* Actions: In PDF (always) + Chỉnh sửa (hidden when status === 'ACTIVE') */}
          {!isEditMode && (
            <div className="flex justify-end mb-2 mt-4">
              <Button onClick={handlePrintPdf} loading={pdfLoading} className="mr-2">In PDF</Button>
              {selectedContract.status !== 'ACTIVE' && (
                <Button type="primary" onClick={() => setIsEditMode(true)}>Chỉnh sửa</Button>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ContractDetailModal;
