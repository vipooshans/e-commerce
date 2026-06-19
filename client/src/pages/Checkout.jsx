import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createOrder, payOrder, confirmStripePayment } from '../services/orderService';
import styles from './Checkout.module.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#F1EEF9',
      fontFamily: '"Outfit", sans-serif',
      fontSize: '16px',
      '::placeholder': { color: '#7A6A9B' },
    },
    invalid: { color: '#EF4444' },
  },
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cartItems, itemsPrice, taxPrice, shippingPrice, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState(1); // 1: shipping, 2: payment
  const [payMethod, setPayMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState({
    address: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    postalCode: user?.addresses?.[0]?.zip || '',
    country: user?.addresses?.[0]?.country || 'India',
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
        paymentMethod: payMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      if (payMethod === 'cod') {
        await payOrder(order._id, 'cod');
        clearCart();
        navigate(`/order-success/${order._id}`);
      } else {
        // Stripe
        const { clientSecret } = await payOrder(order._id, 'stripe');
        const cardElement = elements.getElement(CardElement);
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement, billing_details: { name: user.name, email: user.email } },
        });
        if (error) {
          addToast(error.message, 'error');
          setLoading(false);
          return;
        }
        if (paymentIntent.status === 'succeeded') {
          await confirmStripePayment(order._id, paymentIntent.id);
          clearCart();
          navigate(`/order-success/${order._id}`);
        }
      }
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
          {['Shipping', 'Payment'].map((s, i) => (
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
                { name: 'address', label: 'Street Address', placeholder: '123 Main Street', type: 'text' },
                { name: 'city', label: 'City', placeholder: 'Mumbai', type: 'text' },
                { name: 'postalCode', label: 'Postal Code', placeholder: '400001', type: 'text' },
                { name: 'country', label: 'Country', placeholder: 'India', type: 'text' },
                { name: 'phone', label: 'Phone Number', placeholder: '+91 9876543210', type: 'tel' },
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
              Continue to Payment →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className={`glass-card ${styles.card}`}>
            <h2>Payment Method</h2>

            <div className={styles.paymentOptions}>
              <label className={`${styles.payOption} ${payMethod === 'stripe' ? styles.payActive : ''}`} id="pay-stripe">
                <input type="radio" name="payment" value="stripe" checked={payMethod === 'stripe'} onChange={() => setPayMethod('stripe')} />
                <span className={styles.payIcon}>💳</span>
                <div>
                  <strong>Credit / Debit Card</strong>
                  <small>Secured by Stripe</small>
                </div>
              </label>
              <label className={`${styles.payOption} ${payMethod === 'cod' ? styles.payActive : ''}`} id="pay-cod">
                <input type="radio" name="payment" value="cod" checked={payMethod === 'cod'} onChange={() => setPayMethod('cod')} />
                <span className={styles.payIcon}>💵</span>
                <div>
                  <strong>Cash on Delivery</strong>
                  <small>Pay when you receive</small>
                </div>
              </label>
            </div>

            {payMethod === 'stripe' && (
              <div className={styles.stripeWrap}>
                <label className="form-label">Card Details</label>
                <div className={styles.cardElement}>
                  <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
                <p className={styles.testCardHint}>
                  🧪 Test card: <strong>4242 4242 4242 4242</strong> · Any future date · Any 3-digit CVC
                </p>
              </div>
            )}

            <div className={styles.stepBtns}>
              <button className="btn btn-outline" onClick={() => setStep(1)} id="back-to-shipping-btn">← Back</button>
              <button
                className="btn btn-coral btn-lg"
                onClick={handlePlaceOrder}
                disabled={loading || !stripe}
                id="place-order-btn"
              >
                {loading ? 'Processing...' : `Place Order · ₹${totalPrice.toLocaleString('en-IN')}`}
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
              <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
        <div className={styles.divider} />
        {[['Subtotal', `₹${itemsPrice.toLocaleString('en-IN')}`], ['GST (18%)', `₹${taxPrice.toLocaleString('en-IN')}`], ['Shipping', shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`]].map(([k, v]) => (
          <div key={k} className={styles.summaryLine}>
            <span>{k}</span>
            <span style={{ color: k === 'Shipping' && shippingPrice === 0 ? '#22C55E' : undefined }}>{v}</span>
          </div>
        ))}
        <div className={styles.divider} />
        <div className={`${styles.summaryLine} ${styles.total}`}>
          <span>Total</span>
          <span className="gradient-text">₹{totalPrice.toLocaleString('en-IN')}</span>
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
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
};

export default Checkout;
