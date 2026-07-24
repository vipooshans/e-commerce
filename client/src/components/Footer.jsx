import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.atmosphere} aria-hidden="true">
        <div className={styles.wave} />
        <div className={styles.wave2} />
        <div className={styles.stars}>
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className={styles.star}
              style={{
                left: `${(i * 17) % 100}%`,
                top: `${(i * 29) % 70}%`,
                animationDelay: `${(i % 7) * 0.35}s`,
              }}
            />
          ))}
        </div>
        <div className={styles.gradientLight} />
      </div>

      <div className={`container ${styles.inner}`}>
        <div className={`${styles.brand} ${styles.glassPanel}`}>
          <Link to="/" className={styles.logo}>
            <img src="/logo.png" alt="EverBuyGlobal Logo" style={{ height: '35px', objectFit: 'contain' }} />
          </Link>
          <p>Discover a curated universe of products crafted for modern living.</p>
          <div className={styles.socials}>
            {['𝕏', '📸', '💼', '▶'].map((icon, i) => (
              <a key={i} href="#" className={styles.socialBtn} aria-label={`Social ${i}`} data-magnetic>{icon}</a>
            ))}
          </div>
        </div>

        <div className={styles.links}>
          <div className={`${styles.linkGroup} ${styles.glassPanel}`}>
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?category=Electronics">Electronics</Link>
            <Link to="/products?category=Fashion">Fashion</Link>
            <Link to="/products?category=Home+%26+Kitchen">Home & Kitchen</Link>
          </div>
          <div className={`${styles.linkGroup} ${styles.glassPanel}`}>
            <h4>Account</h4>
            <Link to="/profile">My Profile</Link>
            <Link to="/profile?tab=orders">My Orders</Link>
            <Link to="/profile?tab=wishlist">Wishlist</Link>
            <Link to="/cart">Cart</Link>
          </div>
          <div className={`${styles.linkGroup} ${styles.glassPanel}`}>
            <h4>Support</h4>
            <a href="#">FAQs</a>
            <a href="#">Shipping Policy</a>
            <a href="#">Return Policy</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </div>

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
