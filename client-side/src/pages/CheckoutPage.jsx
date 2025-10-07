import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CreditCard, MapPin, User, Phone, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../api/axiosConfig';
import ClickSpark from "../components/ClickSpark";
const CheckoutPage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const validCartItems = user?.cart?.filter(item => item.product) || [];
  const subtotal = validCartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateStep1 = () => {
    const required = ['fullName', 'email', 'phone', 'street', 'city', 'state', 'zipCode'];
    const missing = required.filter(field => !shippingAddress[field]?.trim());

    if (missing.length > 0) {
      setError('Please fill in all shipping address fields');
      return false;
    }

    if (!shippingAddress.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleStepNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      setError('');
    }
  };

  const handleRazorpayPayment = async () => {
    if (!validCartItems || validCartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: orderData } = await api.post('/payment/create-order', {
        amount: total,
        currency: 'INR',
      });

      if (!orderData.success) {
        throw new Error('Failed to create payment order');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopSphere',
        description: 'Order Payment',
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const { data: verifyData } = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: { shippingAddress },
            });

            if (verifyData.success) {
              setUser({ ...user, cart: [] });
              navigate('/orders', {
                state: {
                  message: `Order #${verifyData.order._id.slice(-8)} placed successfully!`,
                  orderId: verifyData.order._id,
                },
              });
            } else {
              setError('Payment verification failed. Please contact support.');
              setLoading(false);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError(error.response?.data?.msg || 'Payment verification failed');
            setLoading(false);
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        notes: {
          address: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}`,
        },
        theme: { color: '#667eea' },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment cancelled by user');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', async function (response) {
        console.error('Payment failed:', response.error);
        await api.post('/payment/failure', {
          razorpay_order_id: response.error.metadata.order_id,
          error: response.error,
        });
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error('Checkout failed', error);
      setError(error.response?.data?.msg || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  if (!user?.cart || validCartItems.length === 0) {
    return (
      <div className="empty-page-message">
        <h2>Your Cart is Empty</h2>
        <p>Add some items to your cart before checkout.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">Continue Shopping</button>
      </div>
    );
  }

  return (
    <div>
      <ClickSpark
  sparkColor='#fff'
  sparkSize={10}
  sparkRadius={15}
  sparkCount={8}
  duration={400}
>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/cart')} className="btn btn-secondary">
          <ArrowLeft size={18} />
        </button>
        <h1>Checkout</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '2rem' }}>
        {[1, 2].map(step => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: currentStep >= step ? 1 : 0.5 }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: currentStep >= step ? 'var(--primary-color)' : '#e9ecef',
              color: currentStep >= step ? 'white' : '#6c757d',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600'
            }}>
              {currentStep > step ? <CheckCircle size={18} /> : step}
            </div>
            <span style={{ fontWeight: '500', color: '#212529' }}>
              {step === 1 ? 'Shipping Address' : 'Payment'}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', alignItems: 'flex-start' }}>
        <div>
          {error && <div className="error-message">{error}</div>}

          {currentStep === 1 && (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#212529' }}>
                <MapPin size={24} />
                Shipping Address
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#212529' }}>Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                    <input type="text" name="fullName" value={shippingAddress.fullName} onChange={handleAddressChange}
                      className="form-control" style={{ paddingLeft: '40px', color: '#212529' }} required />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#212529' }}>Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                    <input type="email" name="email" value={shippingAddress.email} onChange={handleAddressChange}
                      className="form-control" style={{ paddingLeft: '40px', color: '#212529', backgroundColor: '#ffffff' }} required />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#212529' }}>Phone Number *</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                    <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleAddressChange}
                      className="form-control" style={{ paddingLeft: '40px', color: '#212529' }} required />
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#212529' }}>Street Address *</label>
                  <input type="text" name="street" value={shippingAddress.street} onChange={handleAddressChange}
                    className="form-control" placeholder="123 Main Street" style={{ color: '#212529' }} required />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#212529' }}>City *</label>
                  <input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange}
                    className="form-control" style={{ color: '#212529' }} required />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#212529' }}>State *</label>
                  <input type="text" name="state" value={shippingAddress.state} onChange={handleAddressChange}
                    className="form-control" style={{ color: '#212529' }} required />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#212529' }}>ZIP Code *</label>
                  <input type="text" name="zipCode" value={shippingAddress.zipCode} onChange={handleAddressChange}
                    className="form-control" style={{ color: '#212529' }} required />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#212529' }}>Country *</label>
                  <select name="country" value={shippingAddress.country} onChange={handleAddressChange}
                    className="form-control" style={{ color: '#212529' }} required>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>

              <button onClick={handleStepNext} className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
                Continue to Payment
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#212529' }}>
                <CreditCard size={24} />
                Payment
              </h3>

              <div style={{
                backgroundColor: '#e7f3ff',
                border: '1px solid #b3d9ff',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#084298' }}>
                  Secure Payment via Razorpay
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#084298' }}>
                  You will be redirected to Razorpay's secure payment gateway to complete your purchase. 
                  All payment information is encrypted and secure.
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: '#212529' }}>Accepted Payment Methods:</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '0.5rem'
                }}>
                  {['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallets'].map(method => (
                    <div key={method} style={{
                      padding: '0.75rem',
                      border: '1px solid #e9ecef',
                      borderRadius: '0.5rem',
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      backgroundColor: '#f8f9fa',
                      color: '#212529',
                      fontWeight: '500'
                    }}>
                      {method}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: '#212529' }}>Delivery Address:</h4>
                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '0.5rem', color: '#212529', lineHeight: '1.8' }}>
                  <strong>{shippingAddress.fullName}</strong><br />
                  {shippingAddress.street}<br />
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                  {shippingAddress.country}<br />
                  Phone: {shippingAddress.phone}<br />
                  Email: {shippingAddress.email}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setCurrentStep(1)} 
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Back to Shipping
                </button>
                <button
                  onClick={handleRazorpayPayment}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {loading ? (
                    <>
                      <div style={{ 
                        width: '18px', height: '18px', 
                        border: '2px solid #ffffff40', borderTop: '2px solid #ffffff', 
                        borderRadius: '50%', animation: 'spin 1s linear infinite' 
                      }}></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Pay ${total.toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div style={{
          border: '1px solid #e9ecef',
          borderRadius: '1rem',
          padding: '1.5rem',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          position: 'sticky',
          top: '20px'
        }}>
          <h3 style={{ margin: '0 0 1rem', color: '#212529' }}>Order Summary</h3>

          <div style={{ marginBottom: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
            {validCartItems.map(item => (
              <div key={item.product._id} style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #e9ecef'
              }}>
                <img
                  src={item.product.imageUrl || 'https://placehold.co/60x60/e9ecef/495057?text=No+Image'}
                  alt={item.product.name}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.25rem' }}
                />
                <div style={{ flex: 1 }}>
                  <h5 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#212529' }}>{item.product.name}</h5>
                  <p style={{ margin: 0, color: '#6c757d', fontSize: '0.85rem' }}>
                    Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                  </p>
                </div>
                <div style={{ fontWeight: '600', color: '#212529' }}>
                  ${(item.quantity * item.product.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#212529' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping:</span>
              <span style={{ color: shipping === 0 ? 'var(--success-color)' : '#212529' }}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tax:</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div style={{
              borderTop: '2px solid #e9ecef',
              paddingTop: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.2rem',
              fontWeight: '700'
            }}>
              <span>Total:</span>
              <span style={{ color: 'var(--primary-color)' }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 400px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      </ClickSpark>
    </div>
  );
};

export default CheckoutPage;