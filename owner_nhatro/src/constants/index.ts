// Application constants

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const APP_NAME = 'Quản lý nhà trọ';

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ROOMS: '/rooms',
  ROOM_DETAIL: '/rooms/:id',
  TENANTS: '/tenants',
  TENANT_DETAIL: '/tenants/:id',
  CONTRACTS: '/contracts',
  CONTRACT_DETAIL: '/contracts/:id',
  PAYMENTS: '/payments',
  SETTINGS: '/settings',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const DATE_FORMAT = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm',
} as const;

export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
} as const;
