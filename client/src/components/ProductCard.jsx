import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StarRating from './StarRating';
import Confetti from './Confetti';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addItem, removeItem } = useWishlist();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [confetti, setConfetti] = useState(false);
  const [adding, setAdding] = useState(false);

  const inWishlist = isInWishlist(product._id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const imageSrc = product.images?.[0]
    ? product.images[0].startsWith('http')
      ? product.images[0]
      : `http://localhost:5000${product.images[0]}`
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    setAdding(true);
    addToCart(product, 1);
    setConfetti(true);
    addToast(`${product.name} added to cart!`, 'success');
    setTimeout(() => setAdding(false), 600);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) { addToast('Please login to use wishlist', 'info'); return; }
    if (inWishlist) {
      removeItem(product._id);
      addToast('Removed from wishlist', 'info');
    } else {
      addItem(product._id);
      addToast('Added to wishlist!', 'success');
    }
  };

  return (
    <>
      <Confetti active={confetti} onDone={() => setConfetti(false)} />
      <Link to={`/products/${product._id}`} className={styles.card} id={`product-card-${product._id}`}>
        {/* Image */}
        <div className={styles.imageWrap}>
          {imageSrc ? (
            <img src={imageSrc} alt={product.name} className={styles.image} loading="lazy" />
          ) : (
            <div className={styles.placeholder}>
              <span>🛍️</span>
            </div>
          )}
          {discount > 0 && <span className={styles.discountBadge}>-{discount}%</span>}
          {product.stock === 0 && <div className={styles.outOfStock}>Out of Stock</div>}

          {/* Hover overlay */}
          <div className={styles.overlay}>
            <button
              className={`btn btn-coral btn-sm ${styles.addBtn}`}
              onClick={handleAddToCart}
              disabled={product.stock === 0 || adding}
              id={`add-to-cart-${product._id}`}
            >
              {adding ? '✓ Added!' : '🛒 Add to Cart'}
            </button>
          </div>

          {/* Wishlist */}
          <button
            className={`${styles.wishBtn} ${inWishlist ? styles.wishActive : ''}`}
            onClick={handleWishlist}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            id={`wishlist-btn-${product._id}`}
          >
            {inWishlist ? '♥' : '♡'}
          </button>
        </div>

        {/* Info */}
        <div className={styles.info}>
          <span className={styles.category}>{product.category}</span>
          <h3 className={styles.name}>{product.name}</h3>
          <div className={styles.ratingRow}>
            <StarRating rating={product.rating} size={13} />
            <span className={styles.numReviews}>({product.numReviews})</span>
          </div>
          <div className={styles.priceRow}>
            <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </Link>
    </>
  );
};

export default ProductCard;
