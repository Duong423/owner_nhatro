# Services

## API Services
Các service để gọi API backend.

### Cấu trúc:
- `axios.config.ts` - Cấu hình axios instance, interceptors
- `room.service.ts` - API calls cho phòng trọ
- `tenant.service.ts` - API calls cho khách thuê (cần tạo)
- `contract.service.ts` - API calls cho hợp đồng (cần tạo)
- `payment.service.ts` - API calls cho thanh toán (cần tạo)

### Ví dụ sử dụng:
```typescript
import { roomService } from '@/services/api/room.service';

// Get all rooms
const rooms = await roomService.getRooms({ page: 1, limit: 10 });

// Create new room
const newRoom = await roomService.createRoom({
  name: 'Phòng 101',
  floor: 1,
  area: 20,
  price: 3000000,
  amenities: ['Điều hòa', 'Nóng lạnh']
});
```

## Dependencies cần cài:
```bash
npm install axios
```
