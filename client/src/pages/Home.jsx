import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFeaturedProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import styles from './Home.module.css';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', color: '#3B82F6' },
  { name: 'Fashion', icon: '👗', color: '#EC4899' },
  { name: 'Home & Kitchen', icon: '🏠', color: '#F97316' },
  { name: 'Beauty & Personal Care', icon: '✨', color: '#7C3AED' },
  { name: 'Sports & Fitness', icon: '🏋️', color: '#22C55E' },
  { name: 'Books', icon: '📚', color: '#FBBF24' },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getFeaturedProducts()
      .then(setFeatured)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter">
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <div className={styles.pill}>✦ New Season Arrivals</div>
            <h1>
              Discover Your <br />
              <span className="gradient-text">Perfect Style</span>
            </h1>
            <p>
              Explore thousands of curated products across electronics, fashion, home, beauty, and more.
              Premium quality. Unbeatable prices.
            </p>
            <div className={styles.heroBtns}>
              <Link to="/products" className="btn btn-primary btn-lg" id="hero-shop-btn">
                Shop Now ✦
              </Link>
              <Link to="/products?isFeatured=true" className="btn btn-outline btn-lg">
                View Deals
              </Link>
            </div>
            <div className={styles.heroStats}>
              {[['30+', 'Products'], ['6', 'Categories'], ['FREE', 'Shipping over ₹999']].map(([val, label]) => (
                <div key={label} className={styles.stat}>
                  <span className={styles.statVal}>{val}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.glowOrb} />
            <div className={styles.floatingCard} style={{ animationDelay: '0s' }}>
              <span>💻</span> <span>Electronics</span>
            </div>
            <div className={styles.floatingCard} style={{ animationDelay: '0.5s' }}>
              <span>👗</span> <span>Fashion</span>
            </div>
            <div className={styles.floatingCard} style={{ animationDelay: '1s' }}>
              <span>✨</span> <span>Beauty</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section-sm">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Shop by <span className="gradient-text">Category</span></h2>
            <Link to="/products" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          <div className={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                className={styles.catCard}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                id={`cat-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <span className={styles.catIcon} style={{ background: `${cat.color}20`, color: cat.color }}>
                  {cat.icon}
                </span>
                <span className={styles.catName}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>✦ <span className="gradient-text">Featured</span> Products</h2>
            <Link to="/products" className="btn btn-ghost btn-sm">See all →</Link>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <div className={`grid-auto stagger`}>
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Banner ── */}
      <section className="section-sm">
        <div className="container">
          <div className={styles.banner}>
            <div className={styles.bannerContent}>
              <h2>Free Shipping on Orders Over <span className="gradient-text">₹999</span></h2>
              <p>Plus 30-day hassle-free returns on all products</p>
              <Link to="/products" className="btn btn-coral btn-lg" id="banner-shop-btn">
                Start Shopping
              </Link>
            </div>
            <div className={styles.bannerIcons}>
              {['🚚', '🔒', '↩️', '⭐'].map((icon, i) => (
                <div key={i} className={styles.bannerIcon} style={{ animationDelay: `${i * 0.2}s` }}>
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
