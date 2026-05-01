// Format currency in Indian Rupee format
export const formatPrice = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Get status color class
export const getStatusColor = (status) => {
  const colors = {
    pending: 'badge-warning',
    processing: 'badge-info',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-danger',
    paid: 'badge-success',
    failed: 'badge-danger',
    refunded: 'badge-warning',
  };
  return colors[status] || 'badge-info';
};

// Recently viewed products
export const getRecentlyViewed = () => {
  try {
    return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  } catch {
    return [];
  }
};

export const addToRecentlyViewed = (productId) => {
  let viewed = getRecentlyViewed();
  viewed = viewed.filter(id => id !== productId);
  viewed.unshift(productId);
  viewed = viewed.slice(0, 6);
  localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
