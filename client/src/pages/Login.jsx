import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
import styles from './Auth.module.css';

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { addToast('Please fill all fields', 'error'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      addToast(`Welcome back, ${user.name}! 🎉`, 'success');
      navigate(user.isAdmin ? '/admin/dashboard' : '/');
    } catch (err) {
      addToast(err, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.bgGlow} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <Logo height={48} />
        </div>
        <h2>Welcome Back</h2>
        <p>Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} className={styles.form} id="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="form-input"
              id="login-email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              className="form-input"
              id="login-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} id="login-submit-btn" style={{ width: '100%' }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p className={styles.switchLink}>
          New to EverBuyGlobal? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
