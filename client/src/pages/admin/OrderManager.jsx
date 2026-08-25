import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders, updateOrderPayment, updateOrderStatus } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import styles from './Admin.module.css';

const STATUS_OPTIONS = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
const STATUS_COLORS = { Processing: 'badge-purple', Shipped: 'badge-pink', 'Out for Delivery': 'badge-coral', Delivered: 'badge-green', Cancelled: 'badge-red' };

const OrderManager = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = () => {
    setLoading(true);
    getAllOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      addToast(`Order status updated to ${newStatus}`, 'success');
    } catch (err) { addToast(err, 'error'); }
  };

  const handlePaymentChange = async (orderId, isPaid) => {
    try {
      const updated = await updateOrderPayment(orderId, isPaid);
      setOrders((prev) => prev.map((o) => (
        o._id === orderId
          ? { ...o, isPaid: updated.isPaid, paidAt: updated.paidAt }
          : o
      )));
      addToast(`Payment marked as ${isPaid ? 'Paid' : 'Unpaid'}`, 'success');
    } catch (err) { addToast(err, 'error'); }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.orderStatus === filter);

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <div className={styles.dashHeader}>
          <h1>Order <span className="gradient-text">Manager</span></h1>
          <Link to="/admin/dashboard" className="btn btn-outline btn-sm">← Dashboard</Link>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['all', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(s)}
              id={`filter-order-${s}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <Loader /> : (
          <div className={`glass-card ${styles.recentOrders}`}>
            <div className={styles.table}>
              <div className={`${styles.tableRow} ${styles.tableHead}`} style={{ gridTemplateColumns: '120px 1fr 130px 100px 160px 120px' }}>
                <span>Order ID</span><span>Customer</span><span>Total</span><span>Payment</span><span>Status</span><span>Date</span>
              </div>
              {filtered.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '32px 0', color: '#64748B' }}>No orders found</p>
              ) : filtered.map((order) => (
                <div key={order._id} className={styles.tableRow} style={{ gridTemplateColumns: '120px 1fr 130px 100px 160px 120px' }}>
                  <Link to={`/order/${order._id}`} style={{ color: '#3B82F6', fontWeight: 600, fontSize: '0.875rem' }} id={`order-link-${order._id}`}>
                    #{order._id.slice(-6).toUpperCase()}
                  </Link>
                  <span>{order.user?.name || '—'}<br /><small style={{ color: '#64748B' }}>{order.user?.email}</small></span>
                  <span style={{ fontWeight: 600, color: '#FFFFFF' }}>Rs {order.totalPrice.toLocaleString('en-LK')}</span>
                  <span>
                    <select
                      value={order.isPaid ? 'paid' : 'unpaid'}
                      onChange={(e) => handlePaymentChange(order._id, e.target.value === 'paid')}
                      className="form-select"
                      style={{
                        padding: '6px 10px',
                        fontSize: '0.8rem',
                        color: order.isPaid ? '#22C55E' : '#F97316',
                      }}
                      id={`payment-select-${order._id}`}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                    </select>
                  </span>
                  <span>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="form-select"
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                      id={`status-select-${order._id}`}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManager;
