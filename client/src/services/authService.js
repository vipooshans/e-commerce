import api from './api';

export const loginUser = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const registerUser = async (name, email, password) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const updateMe = async (updates) => {
  const { data } = await api.put('/auth/me', updates);
  return data;
};
