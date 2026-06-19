import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './Auth.module.css';

const Register = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { addToast('Please fill all fields', 'error'); return; }
    if (form.password !== form.confirm) { addToast('Passwords do not match', 'error'); return; }
    if (form.password.length < 6) { addToast('Password must be at least 6 characters', 'error'); return; }
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password);
      addToast(`Welcome to EverBuyGlobal, ${user.name}! 🎉`, 'success');
      navigate('/');
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
          <img src="/logo.png" alt="EverBuyGlobal Logo" style={{ height: '48px', objectFit: 'contain', marginBottom: '10px' }} />
        </div>
        <h2>Create Account</h2>
        <p>Join EverBuyGlobal and start shopping</p>

        <form onSubmit={handleSubmit} className={styles.form} id="register-form">
          {[
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', id: 'reg-name' },
            { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', id: 'reg-email' },
            { name: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters', id: 'reg-password' },
            { name: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password', id: 'reg-confirm' },
          ].map((f) => (
            <div key={f.name} className="form-group">
              <label className="form-label">{f.label}</label>
              <input
                type={f.type}
                name={f.name}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={handleChange}
                className="form-input"
                id={f.id}
              />
            </div>
          ))}

          <button type="submit" className="btn btn-primary" disabled={loading} id="register-submit-btn" style={{ width: '100%' }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
