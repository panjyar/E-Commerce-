import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Package, Clock, CheckCircle, Truck, XCircle, Calendar, X, MapPin, CreditCard, Mail, Phone } from 'lucide-react';
import api from '../api/axiosConfig';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get('/orders');
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders', error);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock size={18} />;
      case 'paid':
        return <CheckCircle size={18} />;
      case 'shipped':
        return <Truck size={18} />;
      case 'delivered':
        return <CheckCircle size={18} />;
      case 'cancelled':
        return <XCircle size={18} />;
      default:
        return <Package size={18} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#ffc107';
      case 'paid':
        return '#28a745';
      case 'shipped':
        return '#17a2b8';
      case 'delivered':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ 
          width: '40px', height: '40px', border: '4px solid #e9ecef', 
          borderTop: '4px solid #0d6efd', borderRadius: '50%', animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>
      </div>
    );
  }

  if (!user || !orders || orders.length === 0) {
    return (
      <div className="empty-page-message">
        <Package size={64} style={{ color: '#6c757d', marginBottom: '1rem' }} />
        <h2>No Orders Yet</h2>
        <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
        <a href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Start Shopping</a>
      </div>
    );
  }

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Package size={32} style={{ color: 'var(--primary-color)' }} />
        <h1 style={{ margin: 0 }}>My Orders</h1>
        <span style={{ 
          backgroundColor: 'var(--primary-color)', color: 'white', 
          padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.9rem' 
        }}>
          {orders.length}
        </span>
      </div>

      <div className="order-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {orders.map(order => (
          <div key={order._id} style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid #e9ecef',
            borderLeft: `4px solid ${getStatusColor(order.status)}`,
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '700', color: '#212529' }}>
                    #{order._id.slice(-8)}
                  </span>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.35rem 0.85rem', borderRadius: '25px',
                    backgroundColor: `${getStatusColor(order.status)}20`,
                    color: getStatusColor(order.status),
                    fontSize: '0.85rem', fontWeight: '700',
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    {getStatusIcon(order.status)}
                    {order.status || 'Pending'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6c757d', fontSize: '0.9rem' }}>
                  <Calendar size={16} />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                  ${order.totalAmount?.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                  {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {order.items?.slice(0, 3).map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
                  <img
                    src={item.product?.imageUrl || 'https://placehold.co/60x60/e9ecef/495057?text=No+Image'}
                    alt={item.product?.name || 'Product'}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e9ecef' }}
                  />
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '0.95rem' }}>{item.product?.name || 'Unknown Product'}</strong>
                    <div style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Qty: {item.quantity} × ${item.price?.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', color: '#212529', fontSize: '1rem' }}>
                    ${(item.quantity * item.price).toFixed(2)}
                  </div>
                </div>
              ))}
              {order.items?.length > 3 && (
                <div style={{ textAlign: 'center', color: '#6c757d', fontSize: '0.9rem', padding: '0.5rem' }}>
                  +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e9ecef' }}>
              <button 
                className="btn btn-primary"
                onClick={() => handleViewDetails(order)}
                style={{ fontSize: '0.9rem', flex: 1 }}
              >
                View Full Details
              </button>
              {order.status === 'delivered' && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => console.log('Reorder:', order._id)}
                  style={{ fontSize: '0.9rem' }}
                >
                  Order Again
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          padding: '1rem', overflowY: 'auto'
        }} onClick={closeModal}>
          <div style={{
            backgroundColor: 'white', borderRadius: '1rem',
            maxWidth: '800px', width: '100%', maxHeight: '90vh',
            overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            animation: 'slideIn 0.3s ease-out'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ 
              padding: '2rem', borderBottom: '1px solid #e9ecef',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem' }}>Order Details</h2>
                <span style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#6c757d' }}>
                  #{selectedOrder._id}
                </span>
              </div>
              <button onClick={closeModal} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.5rem', borderRadius: '0.5rem',
                transition: 'background 0.2s'
              }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                 onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                <X size={24} color="#6c757d" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem' }}>
              {/* Order Status and Info */}
              <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.5rem 1rem', borderRadius: '25px',
                    backgroundColor: `${getStatusColor(selectedOrder.status)}20`,
                    color: getStatusColor(selectedOrder.status),
                    fontSize: '1rem', fontWeight: '700'
                  }}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status || 'Pending'}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                    ${selectedOrder.totalAmount?.toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6c757d' }}>
                  <Calendar size={18} />
                  <span>Ordered on {formatDate(selectedOrder.createdAt)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.25rem' }}>
                    <MapPin size={20} color="var(--primary-color)" />
                    Delivery Address
                  </h3>
                  <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', lineHeight: '1.8', color: '#212529' }}>
                    <strong>{selectedOrder.shippingAddress.fullName}</strong><br />
                    {selectedOrder.shippingAddress.street}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br />
                    {selectedOrder.shippingAddress.country}<br />
                    {selectedOrder.shippingAddress.phone && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={16} /> {selectedOrder.shippingAddress.phone}
                      </div>
                    )}
                    {selectedOrder.shippingAddress.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={16} /> {selectedOrder.shippingAddress.email}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Order Items</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex', gap: '1rem', alignItems: 'center',
                      padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem'
                    }}>
                      <img
                        src={item.product?.imageUrl || 'https://placehold.co/80x80/e9ecef/495057?text=No+Image'}
                        alt={item.product?.name || 'Product'}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.5rem' }}
                      />
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '1rem', color: '#212529' }}>{item.product?.name || 'Unknown Product'}</strong>
                        {item.product?.category && (
                          <div style={{ color: '#6c757d', fontSize: '0.85rem', textTransform: 'capitalize', marginTop: '0.25rem' }}>
                            {item.product.category}
                          </div>
                        )}
                        <div style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                          Quantity: {item.quantity} × ${item.price?.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ fontWeight: '700', color: '#212529', fontSize: '1.1rem' }}>
                        ${(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '0.75rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={20} color="var(--primary-color)" />
                  Payment Summary
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#212529' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: '600' }}>
                      ${selectedOrder.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '2px solid #dee2e6' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>Total:</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                      ${selectedOrder.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .order-header {
            flex-direction: column;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </>
  );
};

export default OrdersPage;