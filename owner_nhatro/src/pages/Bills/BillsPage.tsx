import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Card, Alert, Row, Col, message } from 'antd';
import type { Hostel } from '@/types';
import { roomService } from '@/services/api/room.service';
import { useBillsStore } from '@/store/useBillsStore';
import { BillsListModal } from './modals/BillsListModal';
import { CreateBillModal } from './modals/CreateBillModal';
import { PaymentModal } from './modals/PaymentModal';

export const BillsPage: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Hostel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { 
    fetchBillsByRoom, 
    openBillsModal, 
    openCreateModal,
    reset 
  } = useBillsStore();

  useEffect(() => {
    fetchHostels();
    return () => {
      reset();
    };
  }, [reset]);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await roomService.getMyHostels();
      setHostels(data);
    } catch (err: any) {
      console.error('Error fetching hostels:', err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách phòng trọ');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomClick = async (hostel: Hostel) => {
    const roomCode = hostel.hostelRoomCode || hostel.roomCode;
    
    if (!roomCode) {
      message.warning('Phòng này không có mã phòng');
      return;
    }

    setSelectedRoom(hostel);
    openBillsModal();
    await fetchBillsByRoom(roomCode);
  };

  const handleCreateBill = () => {
    openCreateModal();
  };

  const handleRefreshBills = () => {
    if (selectedRoom) {
      const roomCode = selectedRoom.hostelRoomCode || selectedRoom.roomCode;
      if (roomCode) {
        fetchBillsByRoom(roomCode);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <MainLayout>
      <div className="bills-page p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý hóa đơn</h1>
        </div>

        {error && <Alert message={error} type="error" showIcon className="mb-4" />}

        {/* Room Cards */}
        <Card className="mb-6" title="Chọn phòng để xem hóa đơn" loading={loading}>
          <Row gutter={[16, 16]}>
            {hostels.map((hostel) => {
              const displayRoomCode = hostel.hostelRoomCode || hostel.roomCode || hostel.name;
              
              return (
                <Col key={hostel.hostelId} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    className="text-center"
                    onClick={() => handleRoomClick(hostel)}
                  >
                    <div className="text-4xl font-bold text-indigo-600 mb-2">
                      {displayRoomCode}
                    </div>
                    <div className="text-sm text-gray-600 truncate">{hostel.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{formatCurrency(hostel.price)}</div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>

        {/* Modals */}
        {selectedRoom && (
          <>
            <BillsListModal
              roomCode={selectedRoom.hostelRoomCode || selectedRoom.roomCode || ''}
              roomName={selectedRoom.hostelRoomCode || selectedRoom.roomCode || selectedRoom.name}
              onCreateBill={handleCreateBill}
            />
            <CreateBillModal
              roomCode={selectedRoom.hostelRoomCode || selectedRoom.roomCode || ''}
              onSuccess={handleRefreshBills}
            />
            <PaymentModal onSuccess={handleRefreshBills} />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default BillsPage;