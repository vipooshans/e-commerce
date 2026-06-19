import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { IMAGE_BASE_URL } from '../services/api';
import styles from './Cart.module.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQty, itemsPrice, shippingPrice, totalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="flex-center page-enter" style={{ minHeight: '70vh', flexDirection: 'column', gap: 20 }}>
        <span style={{ fontSize: '4rem' }}>🛒</span>
        <h2>Your cart is empty</h2>
        <p>Add some products to get started!</p>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <h1 style={{ marginBottom: 32 }}>Shopping <span className="gradient-text">Cart</span></h1>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.items}>
            {cartItems.map((item) => {
              const imgSrc = item.images?.[0]
                ? item.images[0].startsWith('http') ? item.images[0] : `${IMAGE_BASE_URL}${item.images[0]}`
                : null;
              return (
                <div key={item._id} className={`glass-card ${styles.item}`}>
                  <div className={styles.itemImage}>
                    {imgSrc ? <img src={imgSrc} alt={item.name} /> : <span>🛍️</span>}
                  </div>
                  <div className={styles.itemInfo}>
                    <Link to={`/products/${item._id}`} className={styles.itemName}>{item.name}</Link>
                    <span className={styles.itemCategory}>{item.category}</span>
                    <span className={styles.itemPrice}>Rs {item.price.toLocaleString('en-LK')}</span>
                  </div>
                  <div className={styles.itemControls}>
                    <div className={styles.qtyControl}>
                      <button onClick={() => updateQty(item._id, item.qty - 1)} className={styles.qtyBtn} id={`qty-dec-${item._id}`}>−</button>
                      <span className={styles.qty}>{item.qty}</span>
                      <button onClick={() => updateQty(item._id, item.qty + 1)} className={styles.qtyBtn} id={`qty-inc-${item._id}`}>+</button>
                    </div>
                    <span className={styles.lineTotal}>Rs {(item.price * item.qty).toLocaleString('en-LK')}</span>
                    <button onClick={() => removeFromCart(item._id)} className={styles.removeBtn} aria-label="Remove" id={`remove-${item._id}`}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className={`glass-card-elevated ${styles.summary}`}>
            <h3>Order Summary</h3>
            <div className={styles.summaryLine}>
              <span>Subtotal</span>
              <span>Rs {itemsPrice.toLocaleString('en-LK')}</span>
            </div>
            <div className={styles.summaryLine}>
              <span>Shipping</span>
              <span>{shippingPrice === 0 ? <span style={{ color: '#22C55E' }}>FREE</span> : `Rs ${shippingPrice}`}</span>
            </div>
            <div className={styles.divider} />
            <div className={`${styles.summaryLine} ${styles.total}`}>
              <span>Total</span>
              <span className="gradient-text">Rs {totalPrice.toLocaleString('en-LK')}</span>
            </div>
            {shippingPrice > 0 && (
              <p className={styles.shippingNote}>Add Rs {(999 - itemsPrice).toFixed(0)} more for FREE shipping</p>
            )}
            <Link to="/checkout" className="btn btn-coral btn-lg" id="checkout-btn" style={{ width: '100%', marginTop: 16 }}>
              Proceed to Checkout →
            </Link>
            <Link to="/products" className="btn btn-ghost btn-sm" style={{ width: '100%', textAlign: 'center' }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
