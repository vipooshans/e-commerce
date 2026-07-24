import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import CartAnimation from './components/CartAnimation';
import Footer from './components/Footer';
import { wakeApi } from './services/api';

// Pages (lazy-ish — direct imports for now)
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/admin/Dashboard';
import ProductManager from './pages/admin/ProductManager';
import OrderManager from './pages/admin/OrderManager';

const LoadingScreen = lazy(() => import('./components/LoadingScreen'));

const BOOT_KEY = 'ebg_boot_seen';

function BootLoader({ onComplete }) {
  const { loading } = useAuth();
  return (
    <Suspense fallback={null}>
      <LoadingScreen ready={!loading} onComplete={onComplete} />
    </Suspense>
  );
}

const AppContent = () => (
  <BrowserRouter>
    <Navbar />
    <CartAnimation />
    <main style={{ flex: 1 }}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/order/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><ProductManager /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><OrderManager /></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
            <h1 className="gradient-text">404</h1>
            <p>Page not found</p>
            <a href="/" className="btn btn-primary btn-sm">Go Home</a>
          </div>
        } />
      </Routes>
    </main>
    <Footer />
  </BrowserRouter>
);

function App() {
  const [showBoot, setShowBoot] = useState(() => {
    try {
      return sessionStorage.getItem(BOOT_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const handleBootComplete = useCallback(() => {
    try {
      sessionStorage.setItem(BOOT_KEY, '1');
    } catch {
      /* ignore quota / private mode */
    }
    setShowBoot(false);
  }, []);

  useEffect(() => {
    // Wake Render free-tier before product fetches (cold starts can look like CORS errors)
    wakeApi();
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            {showBoot && <BootLoader onComplete={handleBootComplete} />}
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
