import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lumora_token');
    if (token) {
      getMe()
        .then((data) => setUser(data))
        .catch(() => localStorage.removeItem('lumora_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    localStorage.setItem('lumora_token', data.token);
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await registerUser(name, email, password);
    localStorage.setItem('lumora_token', data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('lumora_token');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    if (updatedData.token) localStorage.setItem('lumora_token', updatedData.token);
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
