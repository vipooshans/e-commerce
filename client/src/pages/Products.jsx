import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import styles from './Products.module.css';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty & Personal Care', 'Sports & Fitness', 'Books'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [priceMin, setPriceMin] = useState(minPrice);
  const [priceMax, setPriceMax] = useState(maxPrice);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const data = await getProducts(params);
      setProducts(data.products);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [keyword, category, sort, page, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, val) => {
    const params = Object.fromEntries(searchParams);
    if (val) params[key] = val; else delete params[key];
    params.page = '1';
    setSearchParams(params);
  };

  const applyPrice = () => {
    const params = Object.fromEntries(searchParams);
    if (priceMin) params.minPrice = priceMin; else delete params.minPrice;
    if (priceMax) params.maxPrice = priceMax; else delete params.maxPrice;
    params.page = '1';
    setSearchParams(params);
  };

  const clearFilters = () => {
    setPriceMin(''); setPriceMax('');
    setSearchParams({ page: '1' });
  };

  const FilterSidebar = () => (
    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.sidebarHeader}>
        <h3>Filters</h3>
        <button onClick={clearFilters} className="btn btn-ghost btn-sm" id="clear-filters-btn">Clear All</button>
      </div>

      {/* Category */}
      <div className={styles.filterSection}>
        <h4>Category</h4>
        <div className={styles.filterOptions}>
          <button
            className={`${styles.filterChip} ${!category ? styles.active : ''}`}
            onClick={() => updateParam('category', '')}
          >All</button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterChip} ${category === cat ? styles.active : ''}`}
              onClick={() => updateParam('category', cat)}
              id={`filter-cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className={styles.filterSection}>
        <h4>Price Range</h4>
        <div className={styles.priceInputs}>
          <input
            type="number"
            placeholder="Min ₹"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="form-input"
            id="price-min"
          />
          <span>—</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="form-input"
            id="price-max"
          />
        </div>
        <button onClick={applyPrice} className="btn btn-primary btn-sm" id="apply-price-btn" style={{ width: '100%' }}>
          Apply
        </button>
      </div>
    </aside>
  );

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div>
            <h1 style={{ fontSize: '1.75rem' }}>
              {category ? category : keyword ? `Results for "${keyword}"` : 'All Products'}
            </h1>
            <p style={{ fontSize: '0.85rem', marginTop: 4 }}>{total} product{total !== 1 ? 's' : ''} found</p>
          </div>
          <div className={styles.topControls}>
            <button className={`btn btn-outline btn-sm ${styles.filterToggle}`} onClick={() => setSidebarOpen(!sidebarOpen)} id="mobile-filter-btn">
              ⚙ Filters
            </button>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="form-select"
              style={{ width: 'auto' }}
              id="sort-select"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.layout}>
          <FilterSidebar />
          <div className={styles.main}>
            {loading ? (
              <Loader />
            ) : products.length === 0 ? (
              <div className={styles.empty}>
                <span>🔍</span>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid-auto stagger">
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className={styles.pagination}>
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${page === p ? styles.activePage : ''}`}
                        onClick={() => updateParam('page', String(p))}
                        id={`page-btn-${p}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
