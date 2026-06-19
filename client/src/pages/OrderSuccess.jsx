import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import Confetti from '../components/Confetti';
import Loader from '../components/Loader';
import styles from './OrderSuccess.module.css';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    getOrderById(id)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
    // Auto-stop confetti after 4 seconds
    const timer = setTimeout(() => setConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, [id]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="page-enter">
      <Confetti active={confetti} onDone={() => setConfetti(false)} />
      <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className={styles.card}>
          <div className={styles.icon}>🎉</div>
          <h1>Order Confirmed!</h1>
          <p className={styles.sub}>Thank you for your purchase. Your order is being processed.</p>

          <div className={styles.orderId}>
            <span>Order ID</span>
            <strong>#{order?._id?.slice(-8).toUpperCase()}</strong>
          </div>

          {order && (
            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span>Payment Method</span>
                <span>{order.paymentMethod === 'stripe' ? '💳 Card Payment' : '💵 Cash on Delivery'}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Total Amount</span>
                <span className="gradient-text" style={{ fontWeight: 700 }}>Rs {order.totalPrice.toLocaleString('en-LK')}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Items</span>
                <span>{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Delivery to</span>
                <span>{order.shippingAddress?.city}, {order.shippingAddress?.country}</span>
              </div>
            </div>
          )}

          <div className={styles.btns}>
            <Link to={`/order/${id}`} className="btn btn-primary" id="track-order-btn">
              📦 Track Order
            </Link>
            <Link to="/products" className="btn btn-outline" id="continue-shopping-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
