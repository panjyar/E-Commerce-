import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Package, Clock, CheckCircle, Truck, XCircle, Calendar } from 'lucide-react';
import api from '../api/axiosConfig';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        return <Clock size={18} className="status-icon pending" />;
      case 'paid':
        return <CheckCircle size={18} className="status-icon paid" />;
      case 'shipped':
        return <Truck size={18} className="status-icon shipped" />;
      case 'delivered':
        return <CheckCircle size={18} className="status-icon delivered" />;
      case 'cancelled':
        return <XCircle size={18} className="status-icon cancelled" />;
      default:
        return <Package size={18} className="status-icon default" />;
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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <div className="loading-spinner" style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #e9ecef', 
          borderTop: '4px solid #0d6efd', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!user || !orders || orders.length === 0) {
    return (
      <div className="empty-page-message">
        <Package size={64} style={{ color: '#6c757d', marginBottom: '1rem' }} />
        <h2>No Orders Yet</h2>
        <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
        <a href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Start Shopping
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        marginBottom: '2rem' 
      }}>
        <Package size={32} style={{ color: 'var(--primary-color)' }} />
        <h1 className="page-title" style={{ margin: 0 }}>My Orders</h1>
        <span style={{ 
          backgroundColor: 'var(--primary-color)', 
          color: 'white', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '20px', 
          fontSize: '0.9rem' 
        }}>
          {orders.length}
        </span>
      </div>

      <div className="order-list">
        {orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <span className="order-id">#{order._id.slice(-8)}</span>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    backgroundColor: `${getStatusColor(order.status)}20`,
                    color: getStatusColor(order.status),
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {getStatusIcon(order.status)}
                    {order.status || 'Pending'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6c757d' }}>
                  <Calendar size={16} />
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
              </div>
              <div className="order-total" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                  ${order.totalAmount?.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                  {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="order-item-list">
              {order.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <img
                    src={item.product?.imageUrl || 'https://placehold.co/60x60/e9ecef/495057?text=No+Image'}
                    alt={item.product?.name || 'Product'}
                    className="order-item-image"
                  />
                  <div className="order-item-info" style={{ flex: 1 }}>
                    <strong>{item.product?.name || 'Unknown Product'}</strong>
                    <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                      Quantity: {item.quantity} × ${item.price?.toFixed(2)}
                    </div>
                    {item.product?.category && (
                      <div style={{ 
                        color: '#6c757d', 
                        fontSize: '0.8rem',
                        textTransform: 'capitalize'
                      }}>
                        {item.product.category}
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    fontWeight: '600', 
                    color: 'var(--primary-color)',
                    fontSize: '1.1rem'
                  }}>
                    ${(item.quantity * item.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Actions */}
            <div style={{ 
              marginTop: '1rem', 
              paddingTop: '1rem', 
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              gap: '1rem'
            }}>
              <button 
                className="btn btn-secondary"
                onClick={() => console.log('View details for order:', order._id)}
                style={{ fontSize: '0.9rem' }}
              >
                View Details
              </button>
              {order.status === 'delivered' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => console.log('Reorder items:', order._id)}
                  style={{ fontSize: '0.9rem' }}
                >
                  Order Again
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .status-icon.pending { color: #ffc107; }
        .status-icon.paid { color: #28a745; }
        .status-icon.shipped { color: #17a2b8; }
        .status-icon.delivered { color: #28a745; }
        .status-icon.cancelled { color: #dc3545; }
        .status-icon.default { color: #6c757d; }

        @media (max-width: 768px) {
          .order-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 1rem;
          }
          
          .order-total {
            text-align: left !important;
          }
          
          .order-item {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default OrdersPage;