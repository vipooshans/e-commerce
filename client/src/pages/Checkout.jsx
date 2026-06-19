import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createOrder, payOrder } from '../services/orderService';
import styles from './Checkout.module.css';

const CheckoutForm = () => {
  const navigate = useNavigate();
  const { cartItems, itemsPrice, shippingPrice, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState(1); // 1: shipping, 2: confirm
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState({
    address: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    postalCode: user?.addresses?.[0]?.zip || '',
    country: user?.addresses?.[0]?.country || 'Sri Lanka',
    phone: '',
  });

  const handleShippingChange = (e) => setShipping({ ...shipping, [e.target.name]: e.target.value });

  const handlePlaceOrder = async () => {
    if (!shipping.address || !shipping.city || !shipping.postalCode || !shipping.country) {
      addToast('Please fill all shipping fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const orderItems = cartItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.images?.[0] || '',
        price: item.price,
        product: item._id,
      }));

      const order = await createOrder({
        orderItems,
        shippingAddress: shipping,
        paymentMethod: 'whatsapp',
        itemsPrice,
        taxPrice: 0,
        shippingPrice,
        totalPrice,
      });

      await payOrder(order._id, 'whatsapp');
      
      // Generate WhatsApp message
      const message = `🛒 *New Order from Lumora*\n\n` +
        `👤 *Customer Details:*\n` +
        `- Name: ${user.name}\n` +
        `- Phone: ${shipping.phone || 'N/A'}\n` +
        `- Address: ${shipping.address}, ${shipping.city}, ${shipping.postalCode}, ${shipping.country}\n\n` +
        `📦 *Product Details:*\n` +
        orderItems.map(item => `- ${item.name} × ${item.qty} (Rs. ${(item.price * item.qty).toLocaleString('en-LK')})`).join('\n') + `\n\n` +
        `💵 *Total Amount:* Rs. ${totalPrice.toLocaleString('en-LK')}`;

      const whatsappUrl = `https://wa.me/94772078909?text=${encodeURIComponent(message)}`;
      
      clearCart();
      window.open(whatsappUrl, '_blank');
      navigate(`/order-success/${order._id}`);
    } catch (err) {
      addToast(err, 'error');
      setLoading(false);
    }
  };

  return (
    <div className={styles.layout}>
      {/* Left: Steps */}
      <div className={styles.left}>
        {/* Step indicator */}
        <div className={styles.steps}>
          {['Shipping', 'Confirm Order'].map((s, i) => (
            <div key={s} className={`${styles.step} ${step > i ? styles.stepDone : ''} ${step === i + 1 ? styles.stepActive : ''}`}>
              <span className={styles.stepNum}>{step > i + 1 ? '✓' : i + 1}</span>
              <span>{s}</span>
              {i < 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className={`glass-card ${styles.card}`}>
            <h2>Shipping Address</h2>
            <div className={styles.formGrid}>
              {[
                { name: 'address', label: 'Street Address', placeholder: '123 Galle Road', type: 'text' },
                { name: 'city', label: 'City', placeholder: 'Colombo', type: 'text' },
                { name: 'postalCode', label: 'Postal Code', placeholder: '00100', type: 'text' },
                { name: 'country', label: 'Country', placeholder: 'Sri Lanka', type: 'text' },
                { name: 'phone', label: 'Phone Number', placeholder: '+94 77 123 4567', type: 'tel' },
              ].map((field) => (
                <div key={field.name} className="form-group">
                  <label className="form-label">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={shipping[field.name] || ''}
                    onChange={handleShippingChange}
                    className="form-input"
                    id={`shipping-${field.name}`}
                  />
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => setStep(2)} style={{ width: '100%' }} id="next-to-payment-btn">
              Continue to Confirmation →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className={`glass-card ${styles.card}`}>
            <h2>Confirm Your Order</h2>
            
            <div style={{ margin: '20px 0', padding: '15px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', margin: '0 0 10px 0' }}>
                <span style={{ fontSize: '1.4rem' }}>💬</span> <strong>WhatsApp Order Confirmation</strong>
              </p>
              <p style={{ fontSize: '0.9rem', color: '#A098B8', margin: 0, lineHeight: '1.4' }}>
                Your order details will be processed, and you will be redirected to WhatsApp to send us the order and customer information.
              </p>
            </div>

            <div className={styles.stepBtns}>
              <button className="btn btn-outline" onClick={() => setStep(1)} id="back-to-shipping-btn">← Back</button>
              <button
                className="btn btn-coral btn-lg"
                onClick={handlePlaceOrder}
                disabled={loading}
                id="place-order-btn"
              >
                {loading ? 'Processing...' : `Place Order · Rs ${totalPrice.toLocaleString('en-LK')}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: Summary */}
      <div className={`glass-card-elevated ${styles.summary}`}>
        <h3>Order Summary</h3>
        <div className={styles.summaryItems}>
          {cartItems.map((item) => (
            <div key={item._id} className={styles.summaryItem}>
              <span className={styles.summaryItemName}>{item.name} × {item.qty}</span>
              <span>Rs {(item.price * item.qty).toLocaleString('en-LK')}</span>
            </div>
          ))}
        </div>
        <div className={styles.divider} />
        {[['Subtotal', `Rs ${itemsPrice.toLocaleString('en-LK')}`], ['Shipping', shippingPrice === 0 ? 'FREE' : `Rs ${shippingPrice}`]].map(([k, v]) => (
          <div key={k} className={styles.summaryLine}>
            <span>{k}</span>
            <span style={{ color: k === 'Shipping' && shippingPrice === 0 ? '#22C55E' : undefined }}>{v}</span>
          </div>
        ))}
        <div className={styles.divider} />
        <div className={`${styles.summaryLine} ${styles.total}`}>
          <span>Total</span>
          <span className="gradient-text">Rs {totalPrice.toLocaleString('en-LK')}</span>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <h1 style={{ marginBottom: 32 }}>
          Checkout <span className="gradient-text">Securely</span>
        </h1>
        <CheckoutForm />
      </div>
    </div>
  );
};

export default Checkout;
