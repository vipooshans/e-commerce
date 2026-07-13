import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    navigate('/');
    logout();
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <img src="/logo.png" alt="EverBuyGlobal Logo" style={{ height: '42px', objectFit: 'contain' }} />
        </Link>

        {/* Search bar (desktop) */}
        <form onSubmit={handleSearch} className={`${styles.searchForm} hide-mobile`}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            id="navbar-search"
          />
          <button type="submit" className={styles.searchBtn} aria-label="Search">
            🔍
          </button>
        </form>

        {/* Desktop Nav */}
        <div className={`${styles.navLinks} hide-mobile`}>
          <Link to="/products" className={styles.navLink}>Shop</Link>

          {/* Wishlist */}
          {user && (
            <Link to="/profile?tab=wishlist" className={styles.iconBtn} aria-label="Wishlist">
              <span>♡</span>
              {wishlist.length > 0 && <span className={styles.badge}>{wishlist.length}</span>}
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className={styles.iconBtn} aria-label="Cart">
            <span>🛒</span>
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </Link>

          {/* User */}
          {user ? (
            <div className={styles.userSelectWrap}>
              <span className={styles.avatar} aria-hidden="true">{user.name?.[0]?.toUpperCase()}</span>
              <select
                className={styles.userSelect}
                id="user-menu-btn"
                defaultValue=""
                onChange={(e) => {
                  const value = e.target.value;
                  e.target.value = '';
                  if (!value) return;
                  if (value === 'logout') handleLogout();
                  else navigate(value);
                }}
                aria-label="Account menu"
              >
                <option value="" disabled>
                  {user.name?.split(' ')[0] || 'Account'}
                </option>
                <option value="/profile">👤 My Profile</option>
                <option value="/profile?tab=orders">📦 My Orders</option>
                {user.isAdmin && <option value="/admin/dashboard">⚙️ Admin Dashboard</option>}
                <option value="logout">🚪 Logout</option>
              </select>
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile: cart + hamburger */}
        <div className={styles.mobileRight}>
          <Link to="/cart" className={styles.iconBtn} aria-label="Cart">
            <span>🛒</span>
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </Link>
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            id="mobile-menu-btn"
          >
            <span className={menuOpen ? styles.hamOpen : ''}></span>
            <span className={menuOpen ? styles.hamOpen : ''}></span>
            <span className={menuOpen ? styles.hamOpen : ''}></span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
              id="mobile-search"
            />
            <button type="submit" className={styles.searchBtn}>🔍</button>
          </form>
          <Link to="/products" className={styles.mobileLink}>Shop</Link>
          {user ? (
            <>
              <Link to="/profile" className={styles.mobileLink}>My Profile</Link>
              <Link to="/profile?tab=orders" className={styles.mobileLink}>My Orders</Link>
              {user.isAdmin && <Link to="/admin/dashboard" className={styles.mobileLink}>Admin Dashboard</Link>}
              <button onClick={handleLogout} className={styles.mobileLink}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.mobileLink}>Login</Link>
              <Link to="/register" className={styles.mobileLink}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
