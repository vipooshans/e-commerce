import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFeaturedProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import Loader from '../components/Loader';
import styles from './Home.module.css';

const Hero3D = lazy(() => import('../components/Hero3D'));

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
      <Suspense
        fallback={
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
              </div>
              <div className={styles.heroVisual}>
                <div className={styles.glowOrb} />
                <div className={styles.shoeRing} />
                <Loader />
              </div>
            </div>
          </section>
        }
      >
        <Hero3D />
      </Suspense>

      <section className="section-sm">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Shop by <span className="gradient-text">Category</span></h2>
            <Link to="/products" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          <div className={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.name}
                name={cat.name}
                icon={cat.icon}
                color={cat.color}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                id={`cat-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
              />
            ))}
          </div>
        </div>
      </section>

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

      <section className="section-sm">
        <div className="container">
          <div className={styles.banner}>
            <div className={styles.bannerContent}>
              <h2>Mid-Season Sale — Up to <span className="gradient-text">10% Off</span></h2>
              <p>Featured electronics, fashion & beauty. Free shipping on orders over Rs 9999.</p>
              <Link to="/products?isFeatured=true" className="btn btn-coral btn-lg" id="banner-shop-btn" data-magnetic>
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
