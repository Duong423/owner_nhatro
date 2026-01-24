// Rooms page
import { useEffect, useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { roomService } from '@/services/api/room.service';
import type { Hostel, HostelDetail } from '@/types';
import { Button } from '@/components/common';

export const RoomsPage = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedHostel, setSelectedHostel] = useState<HostelDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchHostels();
  }, []);

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleViewDetail = async (hostelId: number) => {
    try {
      setDetailLoading(true);
      const detail = await roomService.getHostelDetail(hostelId);
      setSelectedHostel(detail);
    } catch (err: any) {
      console.error('Error fetching hostel detail:', err);
      alert('Không thể tải chi tiết phòng trọ');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedHostel(null);
  };

  return (
    <MainLayout>
      <div className="rooms-page" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Quản lý phòng trọ</h1>
          <Button variant="primary">+ Thêm phòng trọ mới</Button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee', border: '1px solid #fcc', color: '#c00', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 0' }}>
            <div style={{
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #4f46e5',
              borderRadius: '50%',
              width: '3rem',
              height: '3rem',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : !hostels || hostels.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Chưa có phòng trọ nào</p>
            <Button variant="primary">Thêm phòng trọ đầu tiên</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {hostels.map((hostel) => (
              <div key={hostel.hostelId} style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {/* Image */}
                <div style={{ position: 'relative', height: '12rem', backgroundColor: '#e5e7eb' }}>
                  {hostel.imageUrls && hostel.imageUrls.length > 0 ? (
                    <img
                      src={hostel.imageUrls[0]}
                      alt={hostel.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <svg style={{ width: '4rem', height: '4rem', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>{hostel.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    <span>📍</span> {hostel.address}, {hostel.district}, {hostel.city}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ color: '#6b7280' }}>Giá:</span>
                      <span style={{ fontWeight: '600', color: '#4f46e5', marginLeft: '0.25rem' }}>{formatCurrency(hostel.price)}</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Diện tích:</span>
                      <span style={{ fontWeight: '600', marginLeft: '0.25rem' }}>{hostel.area}m²</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Số phòng:</span>
                      <span style={{ fontWeight: '600', marginLeft: '0.25rem' }}>{hostel.roomCount}</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Loại:</span>
                      <span style={{ fontWeight: '600', marginLeft: '0.25rem' }}>{hostel.roomType}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      <span style={{ fontWeight: '500' }}>Liên hệ:</span> {hostel.contactName}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      <span style={{ fontWeight: '500' }}>SĐT:</span> {hostel.contactPhone}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button 
                      variant="outline" 
                      size="small" 
                      style={{ flex: 1 }}
                      onClick={() => handleViewDetail(hostel.hostelId)}
                      disabled={detailLoading}
                    >
                      Xem chi tiết
                    </Button>
                    <Button variant="secondary" size="small" style={{ flex: 1 }}>Chỉnh sửa</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Chi tiết phòng trọ */}
        {selectedHostel && (
          <div 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}
            onClick={handleCloseDetail}
          >
            <div 
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '0.75rem', 
                maxWidth: '800px', 
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px rgba(0,0,0,0.15)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ 
                padding: '1.5rem', 
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  Chi tiết phòng trọ
                </h2>
                <button 
                  onClick={handleCloseDetail}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '1.5rem', 
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '0.25rem'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: '1.5rem' }}>
                {/* Images */}
                {selectedHostel.imageUrls && selectedHostel.imageUrls.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <img 
                      src={selectedHostel.imageUrls[0]} 
                      alt={selectedHostel.name}
                      style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '0.5rem' }}
                    />
                  </div>
                )}

                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
                  {selectedHostel.name}
                </h3>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {/* Thông tin cơ bản */}
                  <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>Thông tin cơ bản</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <div>
                        <span style={{ color: '#6b7280' }}>Giá thuê:</span>
                        <div style={{ fontWeight: '600', color: '#4f46e5' }}>{formatCurrency(selectedHostel.price)}</div>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>Diện tích:</span>
                        <div style={{ fontWeight: '600' }}>{selectedHostel.area}m²</div>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>Loại phòng:</span>
                        <div style={{ fontWeight: '600' }}>{selectedHostel.roomType}</div>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>Số phòng:</span>
                        <div style={{ fontWeight: '600' }}>{selectedHostel.roomCount}</div>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>Số người ở tối đa:</span>
                        <div style={{ fontWeight: '600' }}>{selectedHostel.maxOccupancy} người</div>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>Ngày tạo:</span>
                        <div style={{ fontWeight: '600' }}>{formatDate(selectedHostel.createdAt)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Địa chỉ */}
                  <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>Địa chỉ</h4>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>
                      📍 {selectedHostel.address}, {selectedHostel.district}, {selectedHostel.city}
                    </p>
                  </div>

                  {/* Thông tin liên hệ */}
                  <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>Thông tin liên hệ</h4>
                    <div style={{ fontSize: '0.875rem' }}>
                      <p style={{ margin: '0.25rem 0' }}><strong>Người liên hệ:</strong> {selectedHostel.contactName}</p>
                      <p style={{ margin: '0.25rem 0' }}><strong>Số điện thoại:</strong> {selectedHostel.contactPhone}</p>
                      <p style={{ margin: '0.25rem 0' }}><strong>Email:</strong> {selectedHostel.contactEmail}</p>
                      <p style={{ margin: '0.25rem 0' }}><strong>Chủ nhà:</strong> {selectedHostel.ownerName}</p>
                    </div>
                  </div>

                  {/* Dịch vụ */}
                  {selectedHostel.services && selectedHostel.services.length > 0 && (
                    <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
                      <h4 style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>Dịch vụ</h4>
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {selectedHostel.services.map((service) => (
                          <div 
                            key={service.serviceId}
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              padding: '0.5rem',
                              backgroundColor: 'white',
                              borderRadius: '0.25rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            <span style={{ fontWeight: '500' }}>{service.serviceName}</span>
                            <span style={{ color: '#4f46e5', fontWeight: '600' }}>
                              {formatCurrency(service.price)}/{service.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mô tả */}
                  {selectedHostel.description && (
                    <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
                      <h4 style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>Mô tả</h4>
                      <p style={{ fontSize: '0.875rem', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>
                        {selectedHostel.description}
                      </p>
                    </div>
                  )}

                  {/* Tiện nghi */}
                  {selectedHostel.amenities && (
                    <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
                      <h4 style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>Tiện nghi</h4>
                      <p style={{ fontSize: '0.875rem', margin: 0 }}>{selectedHostel.amenities}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{ 
                padding: '1rem 1.5rem', 
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.5rem'
              }}>
                <Button variant="secondary" onClick={handleCloseDetail}>Đóng</Button>
                <Button variant="primary">Chỉnh sửa</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
