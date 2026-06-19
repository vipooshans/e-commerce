import { createContext, useContext, useState, useEffect } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getWishlist()
        .then(setWishlist)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setWishlist([]);
    }
  }, [user]);

  const addItem = async (productId) => {
    if (!user) return;
    await addToWishlist(productId);
    setWishlist((prev) =>
      prev.some((p) => (p._id || p) === productId) ? prev : [...prev, { _id: productId }]
    );
    // Refresh from server to get full product data
    const fresh = await getWishlist();
    setWishlist(fresh);
  };

  const removeItem = async (productId) => {
    if (!user) return;
    await removeFromWishlist(productId);
    setWishlist((prev) => prev.filter((p) => (p._id || p) !== productId));
  };

  const isInWishlist = (productId) => wishlist.some((p) => (p._id || p) === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, loading, addItem, removeItem, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
