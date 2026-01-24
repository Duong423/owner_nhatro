# Cấu trúc thư mục dự án

## 📁 Cấu trúc

```
src/
├── assets/                 # Static assets (images, fonts, icons)
├── components/            # Reusable components
│   ├── common/           # Common UI components (Button, Input, Modal, etc.)
│   └── features/         # Feature-specific components
├── config/               # App configuration files
│   └── env.config.ts    # Environment configuration
├── constants/            # Constants and enums
│   └── index.ts         # App constants (routes, pagination, etc.)
├── hooks/                # Custom React hooks
│   └── useLocalStorage.ts
├── layouts/              # Layout components
│   └── MainLayout.tsx   # Main layout wrapper
├── pages/                # Page components (one folder per page)
│   ├── Home/
│   ├── Dashboard/
│   ├── Rooms/
│   ├── Tenants/
│   ├── Contracts/
│   └── Payments/
├── routes/               # Routing configuration
├── services/             # API services and external integrations
│   └── api/
│       ├── axios.config.ts      # Axios setup and interceptors
│       └── room.service.ts      # API endpoints by feature
├── store/                # State management (Redux/Zustand)
│   └── slices/          # State slices
├── styles/               # Global styles
│   └── variables.css    # CSS variables and theme
├── types/                # TypeScript types and interfaces
│   ├── common.types.ts
│   ├── room.types.ts
│   ├── tenant.types.ts
│   ├── contract.types.ts
│   └── payment.types.ts
├── utils/                # Utility functions
│   ├── helpers/         # Helper functions
│   │   └── formatters.ts
│   └── validators/      # Validation functions
│       └── form.validators.ts
├── App.tsx               # Main App component
├── main.tsx             # App entry point
└── env.d.ts             # Environment types

```

## 📝 Giải thích các thư mục

### `/components`
- **common/**: Components tái sử dụng như Button, Input, Modal, Card, v.v.
- **features/**: Components đặc thù cho từng tính năng (VD: RoomCard, TenantList)

### `/pages`
Mỗi page có folder riêng chứa:
- Component chính của page
- Các components con chỉ dùng cho page đó
- Styles riêng nếu cần

### `/services/api`
- Chứa các service gọi API
- Mỗi feature có 1 file service riêng
- axios.config.ts: Cấu hình axios, interceptors

### `/types`
- Định nghĩa tất cả TypeScript types/interfaces
- Chia theo feature để dễ quản lý

### `/utils`
- **helpers/**: Các hàm tiện ích (format currency, date, v.v.)
- **validators/**: Các hàm validation cho form

### `/constants`
- Định nghĩa các constants như routes, API endpoints, configs

### `/hooks`
- Custom React hooks để tái sử dụng logic

### `/store`
- State management (Redux, Zustand, hoặc Context API)
- Chia theo slices/modules

### `/config`
- Các file cấu hình của app
- Environment variables

### `/layouts`
- Layout components (MainLayout, AuthLayout, v.v.)

## 🎯 Best Practices

1. **Import paths**: Sử dụng alias `@/` để import
   ```typescript
   import { Button } from '@/components/common';
   import { formatCurrency } from '@/utils/helpers/formatters';
   ```

2. **Naming conventions**:
   - Components: PascalCase (Button.tsx)
   - Utilities: camelCase (formatters.ts)
   - Constants: UPPER_SNAKE_CASE
   - Types: PascalCase với suffix (Room, RoomDto)

3. **File organization**:
   - Mỗi component có file riêng
   - Export qua index.ts để import dễ dàng
   - Collocate các file liên quan

4. **Type safety**:
   - Định nghĩa types cho tất cả data structures
   - Sử dụng TypeScript strict mode
   - Tránh `any` type

5. **Code splitting**:
   - Lazy load các pages
   - Chia nhỏ components
   - Optimize bundle size

## 🚀 Next Steps

1. Cài đặt dependencies cần thiết (React Router, state management, UI library)
2. Cấu hình path aliases trong tsconfig.json và vite.config.ts
3. Implement routing
4. Setup state management
5. Tạo base components
6. Xây dựng các features
