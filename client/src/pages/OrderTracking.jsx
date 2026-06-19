import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import Loader from '../components/Loader';
import styles from './OrderTracking.module.css';

const STATUSES = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

const STATUS_ICONS = {
  Processing: '📋',
  Shipped: '📦',
  'Out for Delivery': '🚚',
  Delivered: '✅',
  Cancelled: '❌',
};

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (!order) return <p style={{ textAlign: 'center', padding: 60 }}>Order not found</p>;

  const currentStatusIdx = STATUSES.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className={styles.header}>
          <div>
            <h1>Order <span className="gradient-text">Tracking</span></h1>
            <p style={{ marginTop: 4 }}>Order #{order._id?.slice(-8).toUpperCase()}</p>
          </div>
          <Link to="/profile?tab=orders" className="btn btn-outline btn-sm">← All Orders</Link>
        </div>

        {/* Stepper */}
        {!isCancelled ? (
          <div className={`glass-card ${styles.stepper}`}>
            {STATUSES.map((status, i) => {
              const isDone = currentStatusIdx > i;
              const isActive = currentStatusIdx === i;
              return (
                <div key={status} className={styles.stepperItem}>
                  <div className={styles.stepperLeft}>
                    <div className={`${styles.stepCircle} ${isDone ? styles.done : ''} ${isActive ? styles.active : ''}`}>
                      {isDone ? '✓' : STATUS_ICONS[status]}
                    </div>
                    {i < STATUSES.length - 1 && (
                      <div className={`${styles.stepperLine} ${isDone ? styles.lineDone : ''}`} />
                    )}
                  </div>
                  <div className={`${styles.stepperContent} ${isActive ? styles.activeContent : ''}`}>
                    <strong>{status}</strong>
                    {isActive && <span className="badge badge-purple" style={{ marginLeft: 8 }}>Current</span>}
                    {i === 0 && <small>{new Date(order.createdAt).toLocaleString()}</small>}
                    {status === 'Delivered' && order.deliveredAt && <small>{new Date(order.deliveredAt).toLocaleString()}</small>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`glass-card ${styles.cancelledBanner}`}>
            <span>❌</span>
            <div>
              <strong>Order Cancelled</strong>
              <p>This order has been cancelled.</p>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className={styles.detailsGrid}>
          <div className={`glass-card ${styles.detailCard}`}>
            <h3>Order Items</h3>
            {order.orderItems.map((item, i) => (
              <div key={i} className={styles.orderItem}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemQty}>× {item.qty}</span>
                <span className={styles.itemPrice}>Rs {(item.price * item.qty).toLocaleString('en-LK')}</span>
              </div>
            ))}
            <div className={styles.divider} />
            <div className={styles.orderTotal}>
              <span>Total</span>
              <span className="gradient-text" style={{ fontWeight: 700 }}>Rs {order.totalPrice.toLocaleString('en-LK')}</span>
            </div>
          </div>

          <div className={`glass-card ${styles.detailCard}`}>
            <h3>Delivery Info</h3>
            <div className={styles.infoRows}>
              <div className={styles.infoRow}><span>Address</span><span>{order.shippingAddress?.address}</span></div>
              <div className={styles.infoRow}><span>City</span><span>{order.shippingAddress?.city}</span></div>
              <div className={styles.infoRow}><span>Postal Code</span><span>{order.shippingAddress?.postalCode}</span></div>
              <div className={styles.infoRow}><span>Country</span><span>{order.shippingAddress?.country}</span></div>
              <div className={styles.infoRow}><span>Payment</span><span>{order.paymentMethod === 'stripe' ? '💳 Card' : '💵 COD'}</span></div>
              <div className={styles.infoRow}><span>Payment Status</span><span style={{ color: order.isPaid ? '#22C55E' : '#F59E0B' }}>{order.isPaid ? '✓ Paid' : '⏳ Pending'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
