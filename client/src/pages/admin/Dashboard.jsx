import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getOrderStats } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import Loader from '../../components/Loader';
import styles from './Admin.module.css';

const COLORS = ['#7C3AED', '#EC4899', '#3B82F6', '#F97316', '#22C55E', '#FBBF24'];

const StatCard = ({ icon, label, value, color }) => (
  <div className={styles.statCard} style={{ '--stat-color': color }}>
    <div className={styles.statIcon}>{icon}</div>
    <div>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catData, setCatData] = useState([]);

  useEffect(() => {
    Promise.all([getOrderStats(), getProducts({ limit: 200 })])
      .then(([s, p]) => {
        setStats(s);
        setProducts(p.products);
        // Category breakdown
        const counts = {};
        p.products.forEach((prod) => { counts[prod.category] = (counts[prod.category] || 0) + 1; });
        setCatData(Object.entries(counts).map(([name, value]) => ({ name, value })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen />;

  const STATUS_COLORS = { Processing: '#7C3AED', Shipped: '#EC4899', 'Out for Delivery': '#F97316', Delivered: '#22C55E', Cancelled: '#EF4444' };

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <div className={styles.dashHeader}>
          <h1>Admin <span className="gradient-text">Dashboard</span></h1>
          <div className={styles.adminNav}>
            <Link to="/admin/products" className="btn btn-outline btn-sm" id="manage-products-btn">Manage Products</Link>
            <Link to="/admin/orders" className="btn btn-primary btn-sm" id="manage-orders-btn">Manage Orders</Link>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <StatCard icon="💰" label="Total Revenue" value={`Rs ${stats?.totalRevenue?.toLocaleString('en-LK') || 0}`} color="#7C3AED" />
          <StatCard icon="📦" label="Total Orders" value={stats?.totalOrders || 0} color="#EC4899" />
          <StatCard icon="🛍️" label="Products" value={products.length} color="#3B82F6" />
          <StatCard icon="⭐" label="Recent Orders" value={stats?.recentOrders?.length || 0} color="#F97316" />
        </div>

        {/* Charts */}
        <div className={styles.chartsGrid}>
          {/* Sales Line Chart */}
          <div className={`glass-card ${styles.chartCard}`}>
            <h3>7-Day Sales Revenue</h3>
            {stats?.dailySales?.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={stats.dailySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="_id" tick={{ fill: '#7A6A9B', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#7A6A9B', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#1A1230', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    labelStyle={{ color: '#F1EEF9' }}
                    itemStyle={{ color: '#9D63F7' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="url(#gradient)" strokeWidth={2.5} dot={{ fill: '#7C3AED', strokeWidth: 0, r: 4 }} />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.noData}>No sales data yet</div>
            )}
          </div>

          {/* Pie Chart */}
          <div className={`glass-card ${styles.chartCard}`}>
            <h3>Products by Category</h3>
            {catData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                    {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1A1230', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Legend formatter={(value) => <span style={{ color: '#B8A9D9', fontSize: 12 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.noData}>No product data</div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className={`glass-card ${styles.recentOrders}`}>
          <h3>Recent Orders</h3>
          <div className={styles.table}>
            <div className={`${styles.tableRow} ${styles.tableHead}`}>
              <span>Order ID</span>
              <span>Customer</span>
              <span>Total</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {stats?.recentOrders?.map((order) => (
              <Link key={order._id} to={`/order/${order._id}`} className={styles.tableRow} id={`admin-order-${order._id}`}>
                <span>#{order._id.slice(-6).toUpperCase()}</span>
                <span>{order.user?.name}</span>
                <span>Rs {order.totalPrice.toLocaleString('en-LK')}</span>
                <span>
                  <span className="badge" style={{ background: `${STATUS_COLORS[order.orderStatus]}20`, color: STATUS_COLORS[order.orderStatus], border: `1px solid ${STATUS_COLORS[order.orderStatus]}40` }}>
                    {order.orderStatus}
                  </span>
                </span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
          <Link to="/admin/orders" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>View All Orders →</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
