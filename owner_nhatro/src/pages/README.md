# Pages

Mỗi page có folder riêng chứa:
- Component chính (HomePage.tsx, DashboardPage.tsx, v.v.)
- Các components con chỉ dùng cho page đó
- Styles riêng nếu cần
- index.ts để export

## Các pages cần tạo:

### Home (`/`)
- Landing page
- Tổng quan hệ thống

### Dashboard (`/dashboard`)
- Thống kê tổng quan
- Biểu đồ doanh thu
- Tình trạng phòng trống/đã thuê

### Rooms (`/rooms`)
- Danh sách phòng trọ
- Chi tiết phòng
- Thêm/sửa/xóa phòng

### Tenants (`/tenants`)
- Danh sách khách thuê
- Chi tiết khách thuê
- Thêm/sửa/xóa khách thuê

### Contracts (`/contracts`)
- Danh sách hợp đồng
- Chi tiết hợp đồng
- Tạo/gia hạn/chấm dứt hợp đồng

### Payments (`/payments`)
- Lịch sử thanh toán
- Tạo hóa đơn
- Thu tiền
