import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            <img src="/logo.png" alt="EverBuyGlobal Logo" style={{ height: '35px', objectFit: 'contain' }} />
          </Link>
          <p>Discover a curated universe of products crafted for modern living.</p>
          <div className={styles.socials}>
            {['𝕏', '📸', '💼', '▶'].map((icon, i) => (
              <a key={i} href="#" className={styles.socialBtn} aria-label={`Social ${i}`}>{icon}</a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?category=Electronics">Electronics</Link>
            <Link to="/products?category=Fashion">Fashion</Link>
            <Link to="/products?category=Home+%26+Kitchen">Home & Kitchen</Link>
          </div>
          <div className={styles.linkGroup}>
            <h4>Account</h4>
            <Link to="/profile">My Profile</Link>
            <Link to="/profile?tab=orders">My Orders</Link>
            <Link to="/profile?tab=wishlist">Wishlist</Link>
            <Link to="/cart">Cart</Link>
          </div>
          <div className={styles.linkGroup}>
            <h4>Support</h4>
            <a href="#">FAQs</a>
            <a href="#">Shipping Policy</a>
            <a href="#">Return Policy</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className="container">
          <p>© {currentYear} EverBuyGlobal. All rights reserved.</p>
          <div className={styles.paymentIcons}>
            <span className={styles.payIcon}>💳</span>
            <span className={styles.payIcon}>🏦</span>
            <span className={styles.payIcon}>📱</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
