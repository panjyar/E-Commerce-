import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CreditCard, MapPin, User, Phone, Mail, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../api/axiosConfig';

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
    country: 'United States'
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '4111111111111111',
    expiryDate: '12/25',
    cvv: '123',
    cardholderName: 'John Doe'
  });

  // Calculate totals
  const subtotal = user?.cart?.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) || 0;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handlePaymentChange = (e) => {
    let value = e.target.value;
    
    // Format card number
    if (e.target.name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    }
    
    // Format expiry date
    if (e.target.name === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    }
    
    setPaymentDetails({ ...paymentDetails, [e.target.name]: value });
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

  const validateStep2 = () => {
    if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.cardholderName) {
      setError('Please fill in all payment details');
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

  const handlePlaceOrder = async () => {
    if (!validateStep2()) return;
    
    if (!user?.cart || user.cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: user.cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: total,
        shippingAddress,
        paymentDetails: {
          ...paymentDetails,
          transactionId: `dummy_${Date.now()}`,
          method: "Credit Card (Demo)"
        }
      };

      const { data: newOrder } = await api.post('/orders/create', orderData);
      
      // Clear the cart
      setUser({ ...user, cart: [] });

      // Redirect with success message
      navigate('/orders', { 
        state: { 
          message: `Order #${newOrder._id.slice(-8)} placed successfully!`,
          orderId: newOrder._id 
        }
      });
      
    } catch (error) {
      console.error('Checkout failed', error);
      setError(error.response?.data?.msg || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.cart || user.cart.length === 0) {
    return (
      <div className="empty-page-message">
        <h2>Your Cart is Empty</h2>
        <p>Add some items to your cart before checkout.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/cart')} className="btn btn-secondary">
          <ArrowLeft size={18} />
        </button>
        <h1>Checkout</h1>
      </div>

      {/* Progress Steps */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '2rem',
        gap: '2rem'
      }}>
        {[1, 2, 3].map(step => (
          <div key={step} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            opacity: currentStep >= step ? 1 : 0.5
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: currentStep >= step ? 'var(--primary-color)' : '#e9ecef',
              color: currentStep >= step ? 'white' : '#6c757d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600'
            }}>
              {currentStep > step ? <CheckCircle size={18} /> : step}
            </div>
            <span style={{ fontWeight: '500' }}>
              {step === 1 ? 'Shipping' : step === 2 ? 'Payment' : 'Review'}
            </span>
          </div>
        ))}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 400px', 
        gap: '2rem',
        alignItems: 'flex-start'
      }}>
        {/* Main Content */}
        <div>
          {error && <div className="error-message">{error}</div>}

          {/* Step 1: Shipping Address */}
          {currentStep === 1 && (
            <div className="checkout-step">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <MapPin size={24} />
                Shipping Address
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleAddressChange}
                      className="form-control"
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                    <input
                      type="email"
                      name="email"
                      value={shippingAddress.email}
                      onChange={handleAddressChange}
                      className="form-control"
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                      className="form-control"
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleAddressChange}
                    className="form-control"
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={handleAddressChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Country *</label>
                  <select
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleAddressChange}
                    className="form-control"
                    required
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>
              </div>

              <button onClick={handleStepNext} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment Details */}
          {currentStep === 2 && (
            <div className="checkout-step">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <CreditCard size={24} />
                Payment Details
              </h3>

              <div style={{ 
                backgroundColor: '#e7f3ff', 
                border: '1px solid #b3d9ff', 
                padding: '1rem', 
                borderRadius: '0.5rem', 
                marginBottom: '1.5rem' 
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  <strong>Demo Mode:</strong> This is a demonstration. No real payment will be processed. 
                  Use the pre-filled card details or enter your own.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Card Number *</label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentDetails.cardNumber}
                      onChange={handlePaymentChange}
                      className="form-control"
                      style={{ paddingLeft: '40px', fontFamily: 'monospace' }}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={paymentDetails.expiryDate}
                    onChange={handlePaymentChange}
                    className="form-control"
                    style={{ fontFamily: 'monospace' }}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>CVV *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                    <input
                      type="text"
                      name="cvv"
                      value={paymentDetails.cvv}
                      onChange={handlePaymentChange}
                      className="form-control"
                      style={{ paddingLeft: '40px', fontFamily: 'monospace' }}
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Cardholder Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                    <input
                      type="text"
                      name="cardholderName"
                      value={paymentDetails.cardholderName}
                      onChange={handlePaymentChange}
                      className="form-control"
                      style={{ paddingLeft: '40px' }}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button onClick={() => setCurrentStep(1)} className="btn btn-secondary">
                  Back to Shipping
                </button>
                <button onClick={() => setCurrentStep(3)} className="btn btn-primary">
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Order Review */}
          {currentStep === 3 && (
            <div className="checkout-step">
              <h3>Order Review</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h4>Shipping Address</h4>
                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '0.5rem' }}>
                  <p style={{ margin: 0 }}>
                    {shippingAddress.fullName}<br />
                    {shippingAddress.street}<br />
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                    {shippingAddress.country}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4>Payment Method</h4>
                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '0.5rem' }}>
                  <p style={{ margin: 0 }}>
                    Credit Card ending in {paymentDetails.cardNumber.slice(-4)}<br />
                    {paymentDetails.cardholderName}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setCurrentStep(2)} className="btn btn-secondary">
                  Back to Payment
                </button>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {loading ? 'Processing...' : `Place Order - ${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div style={{
          border: '1px solid #e9ecef',
          borderRadius: 'var(--border-radius)',
          padding: '1.5rem',
          backgroundColor: 'white',
          boxShadow: 'var(--box-shadow)',
          position: 'sticky',
          top: '20px'
        }}>
          <h3 style={{ margin: '0 0 1rem' }}>Order Summary</h3>
          
          <div style={{ marginBottom: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
            {user.cart.map(item => (
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
                  <h5 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem' }}>{item.product.name}</h5>
                  <p style={{ margin: 0, color: '#6c757d', fontSize: '0.85rem' }}>
                    Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                  </p>
                </div>
                <div style={{ fontWeight: '600' }}>
                  ${(item.quantity * item.product.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping:</span>
              <span>{shipping === 0 ? 'FREE' : `${shipping.toFixed(2)}`}</span>
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
        .checkout-step {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: var(--border-radius);
          padding: 2rem;
          box-shadow: var(--box-shadow);
        }

        @media (max-width: 768px) {
          [style*="grid-template-columns: 1fr 400px"] {
            grid-template-columns: 1fr !important;
          }
          
          [style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;