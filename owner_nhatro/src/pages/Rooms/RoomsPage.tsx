// Rooms page
import { useEffect, useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { roomService } from '@/services/api/room.service';
import type { Hostel, HostelDetail } from '@/types';
import { Button, Modal, Alert, Skeleton, Form, Input, InputNumber, Upload, message } from 'antd';
import { Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';

export const RoomsPage = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedHostel, setSelectedHostel] = useState<HostelDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [editFileList, setEditFileList] = useState<UploadFile[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    fetchHostels();
  }, []);


  /**
   * 
   *  Fetch owner's hostels
   */
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





  /**
   *  Handle view hostel detail
   * @param hostelId 
   */
  const handleViewDetail = async (hostelId: number) => {
    try {
      setDetailLoading(true);
      const detail = await roomService.getHostelDetail(hostelId);
      setSelectedHostel(detail);
      setCurrentImageIndex(0); // Reset to first image
    } catch (err: any) {
      console.error('Error fetching hostel detail:', err);
      alert('Không thể tải chi tiết phòng trọ');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedHostel(null);
    setCurrentImageIndex(0);
  };

  /**
   * Handle delete hostel
   * @param hostelId 
   */
  const handleDelete = (hostelId: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa phòng trọ',
      content: 'Bạn có chắc chắn muốn xóa phòng trọ này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await roomService.deleteHostel(hostelId);
          fetchHostels();
          Modal.success({
            content: 'Xóa phòng trọ thành công!',
          });
        } catch (err: any) {
          Modal.error({
            title: 'Xóa thất bại',
            content: err?.response?.data?.message || err.message,
          });
        }
      },
    });
  };

  /**
   * Handle create new hostel
   */
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setCreateLoading(true);

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('address', values.address);
      formData.append('price', values.price.toString());
      formData.append('description', values.description);
      
      if (values.area) {
        formData.append('area', values.area.toString());
      }
      if (values.amenities) {
        formData.append('amenities', values.amenities);
      }

      // Add image files
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('imageFiles', file.originFileObj);
        }
      });

      await roomService.createHostel(formData);
      message.success('Tạo phòng trọ thành công!');
      setIsCreateModalOpen(false);
      form.resetFields();
      setFileList([]);
      fetchHostels();
    } catch (err: any) {
      if (err.errorFields) {
        // Form validation errors
        message.error('Vui lòng kiểm tra lại thông tin!');
      } else {
        // API errors
        Modal.error({
          title: 'Tạo phòng trọ thất bại',
          content: err?.response?.data?.message || err.message || 'Có lỗi xảy ra',
        });
      }
    } finally {
      setCreateLoading(false);
    }
  };

  /**
   * Handle open edit modal
   */
  const handleOpenEdit = () => {
    if (!selectedHostel) return;
    
    // Pre-fill form with existing data
    editForm.setFieldsValue({
      title: selectedHostel.name,
      address: selectedHostel.address,
      price: selectedHostel.price,
      area: selectedHostel.area,
      description: selectedHostel.description,
      amenities: selectedHostel.amenities || '',
    });
    
    // Set existing images
    setExistingImages(selectedHostel.imageUrls || []);
    setEditFileList([]);
    setIsEditModalOpen(true);
  };

  /**
   * Handle remove existing image
   */
  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter(url => url !== imageUrl));
  };

  /**
   * Handle update hostel
   */
  const handleUpdate = async () => {
    if (!selectedHostel) return;
    
    try {
      const values = await editForm.validateFields();
      setEditLoading(true);

      let finalImageUrls = [...existingImages];

      // Step 1: Update images if there are changes
      if (editFileList.length > 0 || existingImages.length !== (selectedHostel.imageUrls?.length || 0)) {
        const imageFormData = new FormData();
        
        // Add images to keep
        existingImages.forEach(url => imageFormData.append('keepImages', url));
        
        // Add new image files
        editFileList.forEach(file => {
          if (file.originFileObj) {
            imageFormData.append('imageFiles', file.originFileObj);
          }
        });

        const imageResponse = await roomService.updateHostelImages(selectedHostel.hostelId, imageFormData);
        finalImageUrls = imageResponse.result.imageUrls || [];
      }

      // Step 2: Update hostel info
      const updateData = {
        name: values.title,
        address: values.address,
        description: values.description,
        price: values.price,
        area: values.area,
        amenities: values.amenities || '',
        contactName: selectedHostel.contactName,
        contactPhone: selectedHostel.contactPhone,
        contactEmail: selectedHostel.contactEmail,
        images: finalImageUrls,
      };

      await roomService.updateHostel(selectedHostel.hostelId, updateData);
      message.success('Cập nhật phòng trọ thành công!');
      setIsEditModalOpen(false);
      handleCloseDetail();
      fetchHostels();
    } catch (err: any) {
      if (err.errorFields) {
        message.error('Vui lòng kiểm tra lại thông tin!');
      } else {
        Modal.error({
          title: 'Cập nhật thất bại',
          content: err?.response?.data?.message || err.message || 'Có lỗi xảy ra',
        });
      }
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="rooms-page p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý phòng trọ</h1>
          <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>+ Thêm phòng trọ mới</Button>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon className="mb-4" />
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="mb-4" loading bordered={false}>
                <Skeleton active avatar paragraph={{ rows: 4 }} />
              </Card>
            ))}
          </div>
        ) : !hostels || hostels.length === 0 ? (
          <Card className="text-center">
            <p className="text-gray-500 mb-4">Chưa có phòng trọ nào</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostels.map((hostel) => (
              <Card
                key={hostel.hostelId}
                hoverable
                cover={hostel.imageUrls && hostel.imageUrls.length > 0 ? (
                  <img src={hostel.imageUrls[0]} alt={hostel.name} className="h-48 w-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-200">
                    <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                )}
                className="mb-4"
              >
                <Card.Meta
                  title={<span className="text-lg font-semibold text-gray-900">{hostel.name}</span>}
                  description={
                    <>
                      <p className="text-sm text-gray-500 mb-2">
                        <span>📍</span> {hostel.address}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500">Giá:</span>
                          <span className="font-semibold text-indigo-600 ml-1">{formatCurrency(hostel.price)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Diện tích:</span>
                          <span className="font-semibold ml-1">{hostel.area}m²</span>
                        </div>
                        
                      </div>
                      <div className="border-t border-gray-200 pt-3 mb-3">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Liên hệ:</span> {hostel.contactName}
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">SĐT:</span> {hostel.contactPhone}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="default" className="flex-1" onClick={() => handleViewDetail(hostel.hostelId)} disabled={detailLoading}>
                          Xem chi tiết
                        </Button>
                        <Button type="dashed" className="flex-1" danger onClick={() => handleDelete(hostel.hostelId)}>
                          Xóa
                        </Button>
                      </div>
                    </>
                  }
                />
              </Card>
            ))}
          </div>
        )}

        {/* Modal Chi tiết phòng trọ */}
        <Modal
          open={!!selectedHostel}
          onCancel={handleCloseDetail}
          footer={null}
          title="Chi tiết phòng trọ"
          width={800}
        >
          {selectedHostel && (
            <div>
              {/* Main image */}
              {selectedHostel.imageUrls && selectedHostel.imageUrls.length > 0 && (
                <>
                  <img
                    src={selectedHostel.imageUrls[currentImageIndex]}
                    alt={selectedHostel.name}
                    className="w-full h-72 object-cover rounded mb-4"
                  />
                  {/* Thumbnails slider if more than 1 image */}
                  {selectedHostel.imageUrls.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto mb-6 pb-2" style={{ scrollbarWidth: 'thin' }}>
                      {selectedHostel.imageUrls.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Ảnh ${idx + 1}`}
                          className="h-20 w-28 flex-shrink-0 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ 
                            border: idx === currentImageIndex ? '3px solid #1677ff' : '2px solid #e5e7eb'
                          }}
                          onClick={() => {
                            setCurrentImageIndex(idx);
                            // Scroll to top to see the main image
                            const modal = document.querySelector('.ant-modal-body');
                            if (modal) modal.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
              <h3 className="text-xl font-bold mb-4 text-gray-900">{selectedHostel.name}</h3>
              <div className="grid gap-4">
                <Card className="bg-gray-50" title="Thông tin cơ bản" bordered={false}>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Giá thuê:</span>
                      <div className="font-semibold text-indigo-600">{formatCurrency(selectedHostel.price)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Diện tích:</span>
                      <div className="font-semibold">{selectedHostel.area}m²</div>
                    </div>
                  
                    <div>
                      <span className="text-gray-500">Ngày tạo:</span>
                      <div className="font-semibold">{formatDate(selectedHostel.createdAt)}</div>
                    </div>
                  </div>
                </Card>
                <Card className="bg-gray-50" title="Địa chỉ" bordered={false}>
                  <p className="text-sm">📍 {selectedHostel.address}</p>
                </Card>
                <Card className="bg-gray-50" title="Thông tin liên hệ" bordered={false}>
                  <div className="text-sm">
                    <p><strong>Người liên hệ:</strong> {selectedHostel.contactName}</p>
                    <p><strong>Số điện thoại:</strong> {selectedHostel.contactPhone}</p>
                    <p><strong>Email:</strong> {selectedHostel.contactEmail}</p>
                    <p><strong>Chủ nhà:</strong> {selectedHostel.ownerName}</p>
                  </div>
                </Card>
               
                {selectedHostel.description && (
                  <Card className="bg-gray-50" title="Mô tả" bordered={false}>
                    <p className="text-sm whitespace-pre-line">{selectedHostel.description}</p>
                  </Card>
                )}
                {selectedHostel.amenities && (
                  <Card className="bg-gray-50" title="Tiện nghi" bordered={false}>
                    <p className="text-sm">{selectedHostel.amenities}</p>
                  </Card>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={handleCloseDetail}>Đóng</Button>
                <Button type="primary" onClick={handleOpenEdit}>Chỉnh sửa</Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal Thêm phòng trọ mới */}
        <Modal
          title="Thêm phòng trọ mới"
          open={isCreateModalOpen}
          onOk={handleCreate}
          onCancel={() => {
            setIsCreateModalOpen(false);
            form.resetFields();
            setFileList([]);
          }}
          okText="Tạo phòng trọ"
          cancelText="Hủy"
          confirmLoading={createLoading}
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
            className="mt-4"
          >
            <Form.Item
              label="Tên phòng trọ"
              name="title"
              rules={[
                { required: true, message: 'Vui lòng nhập tên phòng trọ!' },
                { min: 3, message: 'Tên phòng trọ phải có ít nhất 3 ký tự!' },
              ]}
            >
              <Input placeholder="VD: Nhà trọ cao cấp quận 1" />
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[
                { required: true, message: 'Vui lòng nhập địa chỉ!' },
                { min: 5, message: 'Địa chỉ phải có ít nhất 5 ký tự!' },
              ]}
            >
              <Input placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP.HCM" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Giá thuê (VNĐ)"
                name="price"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá thuê!' },
                  { type: 'number', min: 0, message: 'Giá thuê phải lớn hơn 0!' },
                ]}
              >
                <InputNumber
                  placeholder="3500000"
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item
                label="Diện tích (m²)"
                name="area"
                rules={[
                  { type: 'number', min: 0, message: 'Diện tích phải lớn hơn 0!' },
                ]}
              >
                <InputNumber
                  placeholder="25"
                  style={{ width: '100%' }}
                  step={0.1}
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[
                { required: true, message: 'Vui lòng nhập mô tả!' },
                { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự!' },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Phòng trọ rộng rãi, thoáng mát, đầy đủ tiện nghi..."
              />
            </Form.Item>

            <Form.Item
              label="Tiện ích"
              name="amenities"
            >
              <Input placeholder="VD: Wifi, Điều hòa, Máy giặt, Tủ lạnh" />
            </Form.Item>

            <Form.Item
              label="Hình ảnh"
              extra="Chọn nhiều ảnh để tải lên"
            >
              <Upload
                fileList={fileList}
                onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                beforeUpload={() => false}
                listType="picture"
                multiple
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal Chỉnh sửa phòng trọ */}
        <Modal
          title="Chỉnh sửa phòng trọ"
          open={isEditModalOpen}
          onOk={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            editForm.resetFields();
            setEditFileList([]);
            setExistingImages([]);
          }}
          okText="Cập nhật"
          cancelText="Hủy"
          confirmLoading={editLoading}
          width={700}
        >
          <Form
            form={editForm}
            layout="vertical"
            className="mt-4"
          >
            <Form.Item
              label="Tên phòng trọ"
              name="title"
              rules={[
                { required: true, message: 'Vui lòng nhập tên phòng trọ!' },
                { min: 3, message: 'Tên phòng trọ phải có ít nhất 3 ký tự!' },
              ]}
            >
              <Input placeholder="VD: Nhà trọ cao cấp quận 1" />
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[
                { required: true, message: 'Vui lòng nhập địa chỉ!' },
                { min: 5, message: 'Địa chỉ phải có ít nhất 5 ký tự!' },
              ]}
            >
              <Input placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP.HCM" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Giá thuê (VNĐ)"
                name="price"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá thuê!' },
                  { type: 'number', min: 0, message: 'Giá thuê phải lớn hơn 0!' },
                ]}
              >
                <InputNumber
                  placeholder="3500000"
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item
                label="Diện tích (m²)"
                name="area"
                rules={[
                  { type: 'number', min: 0, message: 'Diện tích phải lớn hơn 0!' },
                ]}
              >
                <InputNumber
                  placeholder="25"
                  style={{ width: '100%' }}
                  step={0.1}
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[
                { required: true, message: 'Vui lòng nhập mô tả!' },
                { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự!' },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Phòng trọ rộng rãi, thoáng mát, đầy đủ tiện nghi..."
              />
            </Form.Item>

            <Form.Item
              label="Tiện ích"
              name="amenities"
            >
              <Input placeholder="VD: Wifi, Điều hòa, Máy giặt, Tủ lạnh" />
            </Form.Item>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Ảnh hiện tại</label>
                <div className="flex gap-2 flex-wrap">
                  {existingImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-24 h-24 object-cover rounded border"
                      />
                      <Button
                        type="primary"
                        danger
                        size="small"
                        className="absolute top-0 right-0"
                        onClick={() => handleRemoveExistingImage(url)}
                      >
                        X
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Upload */}
            <Form.Item
              label="Thêm ảnh mới"
              extra="Chọn nhiều ảnh để tải lên"
            >
              <Upload
                fileList={editFileList}
                onChange={({ fileList: newFileList }) => setEditFileList(newFileList)}
                beforeUpload={() => false}
                listType="picture"
                multiple
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};
