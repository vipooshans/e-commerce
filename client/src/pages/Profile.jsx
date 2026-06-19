import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { getMyOrders } from '../services/orderService';
import { updateMe } from '../services/authService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import styles from './Profile.module.css';

const TABS = ['orders', 'wishlist', 'addresses', 'settings'];

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';
  const setTab = (t) => setSearchParams({ tab: t });

  const { user, updateUser } = useAuth();
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', password: '' });

  useEffect(() => {
    if (activeTab === 'orders') {
      setOrdersLoading(true);
      getMyOrders().then(setOrders).catch(console.error).finally(() => setOrdersLoading(false));
    }
  }, [activeTab]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = { name: profileForm.name, email: profileForm.email };
      if (profileForm.password) updates.password = profileForm.password;
      const updated = await updateMe(updates);
      updateUser(updated);
      addToast('Profile updated!', 'success');
    } catch (err) {
      addToast(err, 'error');
    } finally {
      setSaving(false);
    }
  };

  const STATUS_COLORS = {
    Processing: 'badge-purple',
    Shipped: 'badge-pink',
    'Out for Delivery': 'badge-coral',
    Delivered: 'badge-green',
    Cancelled: 'badge-red',
  };

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.avatar}>
            <span>{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
            {user?.isAdmin && <span className="badge badge-purple" style={{ marginTop: 6 }}>Admin</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${activeTab === t ? styles.activeTab : ''}`}
              onClick={() => setTab(t)}
              id={`profile-tab-${t}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="animate-fadeInUp">
            {ordersLoading ? <Loader /> : orders.length === 0 ? (
              <div className={styles.empty}>
                <span>📦</span>
                <h3>No orders yet</h3>
                <Link to="/products" className="btn btn-primary">Start Shopping</Link>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {orders.map((order) => (
                  <div key={order._id} className={`glass-card ${styles.orderRow}`}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-purple'}`}>{order.orderStatus}</span>
                    </div>
                    <div className={styles.orderInfo}>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span>{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</span>
                      <span className="gradient-text" style={{ fontWeight: 700 }}>Rs {order.totalPrice.toLocaleString('en-LK')}</span>
                    </div>
                    <Link to={`/order/${order._id}`} className="btn btn-outline btn-sm" id={`view-order-${order._id}`}>Track →</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="animate-fadeInUp">
            {wishlistLoading ? <Loader /> : wishlist.length === 0 ? (
              <div className={styles.empty}>
                <span>♡</span>
                <h3>Your wishlist is empty</h3>
                <Link to="/products" className="btn btn-primary">Explore Products</Link>
              </div>
            ) : (
              <div className="grid-auto stagger">
                {wishlist.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="animate-fadeInUp">
            {user?.addresses?.length === 0 ? (
              <div className={styles.empty}>
                <span>🏠</span>
                <h3>No saved addresses</h3>
                <p>Your saved addresses will appear here</p>
              </div>
            ) : (
              <div className={styles.addressGrid}>
                {user?.addresses?.map((addr, i) => (
                  <div key={i} className={`glass-card ${styles.addressCard}`}>
                    <span className="badge badge-purple">{addr.label}</span>
                    <p>{addr.street}</p>
                    <p>{addr.city}, {addr.state} {addr.zip}</p>
                    <p>{addr.country}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="animate-fadeInUp">
            <div className={`glass-card ${styles.settingsCard}`}>
              <h3>Edit Profile</h3>
              <form onSubmit={handleProfileSave} className={styles.settingsForm} id="profile-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="form-input" id="profile-name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="form-input" id="profile-email" />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password <span style={{ color: '#7A6A9B', fontWeight: 400 }}>(leave blank to keep current)</span></label>
                  <input type="password" value={profileForm.password} onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })} className="form-input" placeholder="New password" id="profile-password" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving} id="save-profile-btn">{saving ? 'Saving...' : 'Save Changes'}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
