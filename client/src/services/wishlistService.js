import api from './api';

export const getWishlist = async () => {
  const { data } = await api.get('/wishlist');
  return data;
};

export const addToWishlist = async (productId) => {
  const { data } = await api.post('/wishlist', { productId });
  return data;
};

export const removeFromWishlist = async (productId) => {
  const { data } = await api.delete(`/wishlist/${productId}`);
  return data;
};
