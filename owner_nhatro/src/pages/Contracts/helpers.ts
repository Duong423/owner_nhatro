export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'green',
    'PENDING': 'gold',
    'EXPIRED': 'default',
    'TERMINATED': 'red',
  };
  return statusMap[status] || 'default';
};

export const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'Đang hiệu lực',
    'PENDING': 'Chờ ký',
    'EXPIRED': 'Hết hạn',
    'TERMINATED': 'Đã chấm dứt',
  };
  return statusMap[status] || status;
};

export default {};
