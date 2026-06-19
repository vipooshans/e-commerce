import api from './api';

export const getProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params });
  return data;
};

export const getFeaturedProducts = async () => {
  const { data } = await api.get('/products/featured');
  return data;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const createProduct = async (formData) => {
  const { data } = await api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateProduct = async (id, formData) => {
  const { data } = await api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

export const addReview = async (id, review) => {
  const { data } = await api.post(`/products/${id}/reviews`, review);
  return data;
};

export const getCategories = async () => {
  const { data } = await api.get('/products/categories');
  return data;
};
