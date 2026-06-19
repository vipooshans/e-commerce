import api from './api';

export const createOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await api.get('/orders/myorders');
  return data;
};

export const getOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

export const payOrder = async (id, paymentMethod) => {
  const { data } = await api.put(`/orders/${id}/pay`, { paymentMethod });
  return data;
};

export const confirmStripePayment = async (id, paymentIntentId) => {
  const { data } = await api.put(`/orders/${id}/pay/confirm`, { paymentIntentId });
  return data;
};

export const getAllOrders = async () => {
  const { data } = await api.get('/orders');
  return data;
};

export const updateOrderStatus = async (id, orderStatus) => {
  const { data } = await api.put(`/orders/${id}/status`, { orderStatus });
  return data;
};

export const getOrderStats = async () => {
  const { data } = await api.get('/orders/stats');
  return data;
};
