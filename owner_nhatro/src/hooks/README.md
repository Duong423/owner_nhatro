# Custom Hooks

## Đã có:
- `useLocalStorage` - Hook để lưu/đọc dữ liệu từ localStorage

## Cần thêm:
- `useFetch` - Hook để fetch data từ API
- `useDebounce` - Hook để debounce input
- `useToggle` - Hook để toggle boolean state
- `useClickOutside` - Hook để detect click outside element
- `useAuth` - Hook để quản lý authentication
- `usePagination` - Hook để quản lý pagination
- `useModal` - Hook để quản lý modal state

## Ví dụ sử dụng:
```typescript
import { useLocalStorage } from '@/hooks/useLocalStorage';

function MyComponent() {
  const [user, setUser] = useLocalStorage('user', null);
  
  return <div>Welcome, {user?.name}</div>;
}
```
