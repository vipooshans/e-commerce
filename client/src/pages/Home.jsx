import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { getFeaturedProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import styles from './Home.module.css';

const ProductScrollScene = lazy(() => import('../components/ProductScrollScene'));

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
  const reduceMotion = useReducedMotion();

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
              {[['30+', 'Products'], ['6', 'Categories'], ['FREE', 'Shipping over Rs 999']].map(([val, label]) => (
                <div key={label} className={styles.stat}>
                  <span className={styles.statVal}>{val}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.glowOrb} />
            <div className={styles.shoeRing} />
            <motion.div
              className={styles.shoeStage}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.72, rotate: -18 }}
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
            >
              <motion.img
                src="/hero-shoe.jpg"
                alt="Red sneaker floating in the air"
                className={styles.heroShoe}
                animate={reduceMotion ? undefined : {
                  y: [0, -18, 0],
                  rotate: [-8, -3, -8],
                }}
                transition={{
                  duration: 4,
                  ease: 'easeInOut',
                  repeat: Infinity,
                }}
                whileHover={reduceMotion ? undefined : { scale: 1.06, rotate: 0 }}
              />
              <motion.div
                className={styles.shoeShadow}
                animate={reduceMotion ? undefined : {
                  scaleX: [1, 0.78, 1],
                  opacity: [0.45, 0.25, 0.45],
                }}
                transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
              />
            </motion.div>
            <div className={`${styles.floatingCard} ${styles.cardTop}`}>
              <span>⚡</span> New drop
            </div>
            <div className={`${styles.floatingCard} ${styles.cardBottom}`}>
              <span>★</span> 4.9 rating
            </div>
          </div>
        </div>
      </section>

      {/* ── Scroll-driven 3D product ── */}
      <Suspense fallback={null}>
        <ProductScrollScene />
      </Suspense>

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
              <h2>Mid-Season Sale — Up to <span className="gradient-text">10% Off</span></h2>
              <p>Featured electronics, fashion & beauty. Free shipping on orders over Rs 9999.</p>
              <Link to="/products?isFeatured=true" className="btn btn-coral btn-lg" id="banner-shop-btn">
                Shop the Sale
              </Link>
            </div>
            <div className={styles.bannerIcons}>
              {['🔥', '🚚', '💳', '⭐'].map((icon, i) => (
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
