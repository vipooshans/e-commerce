import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, addReview } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/StarRating';
import Confetti from '../components/Confetti';
import Loader from '../components/Loader';
import { IMAGE_BASE_URL } from '../services/api';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, addItem, removeItem } = useWishlist();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [confetti, setConfetti] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [tab, setTab] = useState('description');

  const inWishlist = isInWishlist(id);

  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then(setProduct)
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <Loader fullScreen />;
  if (!product) return null;

  const images = product.images?.length > 0
    ? product.images.map((img) => img.startsWith('http') ? img : `${IMAGE_BASE_URL}${img}`)
    : null;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addToCart(product, qty);
    setConfetti(true);
    addToast(`${product.name} added to cart!`, 'success');
  };

  const handleWishlist = () => {
    if (!user) { addToast('Please login to use wishlist', 'info'); return; }
    if (inWishlist) {
      removeItem(product._id);
      addToast('Removed from wishlist', 'info');
    } else {
      addItem(product._id);
      addToast('Added to wishlist!', 'success');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { addToast('Please login to leave a review', 'info'); return; }
    if (!reviewComment.trim()) { addToast('Please write a comment', 'error'); return; }
    setSubmittingReview(true);
    try {
      await addReview(id, { rating: reviewRating, comment: reviewComment });
      addToast('Review submitted!', 'success');
      setReviewComment('');
      setReviewRating(5);
      // Refresh product
      const updated = await getProductById(id);
      setProduct(updated);
    } catch (err) {
      addToast(err, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="page-enter">
      <Confetti active={confetti} onDone={() => setConfetti(false)} />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <a href="/products">Products</a> / <a href={`/products?category=${product.category}`}>{product.category}</a> / <span>{product.name}</span>
        </div>

        {/* Main grid */}
        <div className={styles.grid}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {images ? (
                <img src={images[activeImage]} alt={product.name} className={styles.mainImg} />
              ) : (
                <div className={styles.imgPlaceholder}>🛍️</div>
              )}
              {discount > 0 && <span className={styles.discountBadge}>-{discount}%</span>}
            </div>
            {images && images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${activeImage === i ? styles.activeThumb : ''}`}
                    onClick={() => setActiveImage(i)}
                    id={`thumb-${i}`}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <span className={styles.category}>{product.category} · {product.brand}</span>
            <h1 className={styles.name}>{product.name}</h1>

            <div className={styles.ratingRow}>
              <StarRating rating={product.rating} size={18} />
              <span className={styles.ratingNum}>{product.rating.toFixed(1)}</span>
              <span className={styles.numReviews}>({product.numReviews} reviews)</span>
            </div>

            <div className={styles.priceBlock}>
              <span className={styles.price}>Rs {product.price.toLocaleString('en-LK')}</span>
              {product.originalPrice && (
                <span className={styles.originalPrice}>Rs {product.originalPrice.toLocaleString('en-LK')}</span>
              )}
              {discount > 0 && <span className={styles.saving}>You save Rs {(product.originalPrice - product.price).toLocaleString('en-LK')}</span>}
            </div>

            <div className={styles.stockRow}>
              {product.stock > 0 ? (
                <span className="badge badge-green">✓ In Stock ({product.stock} available)</span>
              ) : (
                <span className="badge badge-red">✕ Out of Stock</span>
              )}
            </div>

            {/* Qty & Add to cart */}
            {product.stock > 0 && (
              <div className={styles.actions}>
                <div className={styles.qtyControl}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className={styles.qtyBtn} id="qty-dec">−</button>
                  <span className={styles.qty}>{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className={styles.qtyBtn} id="qty-inc">+</button>
                </div>
                <button
                  className="btn btn-coral btn-lg"
                  onClick={handleAddToCart}
                  style={{ flex: 1 }}
                  id="add-to-cart-btn"
                >
                  🛒 Add to Cart
                </button>
                <button
                  className={`btn btn-outline btn-icon ${inWishlist ? styles.wishActive : ''}`}
                  onClick={handleWishlist}
                  aria-label="Wishlist"
                  id="wishlist-btn"
                >
                  {inWishlist ? '♥' : '♡'}
                </button>
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={() => { handleAddToCart(); setTimeout(() => navigate('/cart'), 300); }}
              disabled={product.stock === 0}
              id="buy-now-btn"
              style={{ width: '100%' }}
            >
              ⚡ Buy Now
            </button>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className={styles.tags}>
                {product.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {['description', 'reviews'].map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.activeTab : ''}`}
              onClick={() => setTab(t)}
              id={`tab-${t}`}
            >
              {t === 'description' ? 'Description' : `Reviews (${product.numReviews})`}
            </button>
          ))}
        </div>

        {tab === 'description' ? (
          <div className={`glass-card ${styles.descCard}`}>
            <p style={{ lineHeight: 1.8 }}>{product.description}</p>
          </div>
        ) : (
          <div className={styles.reviewsSection}>
            {/* Write review */}
            {user && (
              <form onSubmit={handleReview} className={`glass-card ${styles.reviewForm}`}>
                <h3>Write a Review</h3>
                <div className="form-group">
                  <label className="form-label">Your Rating</label>
                  <StarRating rating={reviewRating} interactive onRate={setReviewRating} size={28} />
                </div>
                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Share your experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    id="review-comment"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submittingReview} id="submit-review-btn">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {/* Reviews list */}
            {product.reviews.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 40 }}>No reviews yet. Be the first!</p>
            ) : (
              <div className={styles.reviewsList}>
                {product.reviews.map((r) => (
                  <div key={r._id} className={`glass-card ${styles.reviewCard}`}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewAvatar}>{r.name?.[0]?.toUpperCase()}</span>
                      <div>
                        <strong>{r.name}</strong>
                        <StarRating rating={r.rating} size={13} />
                      </div>
                      <span className={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
