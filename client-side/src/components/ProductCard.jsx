import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShoppingCart, Heart, Eye, Star, Package } from 'lucide-react';
import api from '../api/axiosConfig';

const ProductCard = ({ product }) => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState({ cart: false, wishlist: false });
  const [isWishlisted, setIsWishlisted] = useState(
    user?.wishlist?.some(item => item._id === product._id) || false
  );

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert("Please log in to add items to your cart.");
      return;
    }
    
    setLoading(prev => ({ ...prev, cart: true }));
    
    try {
      const { data: updatedCart } = await api.post('/cart/add', { 
        productId: product._id, 
        quantity: 1 
      });
      setUser({ ...user, cart: updatedCart });
      
      // Show success feedback
      const button = e.target.closest('button');
      const originalText = button.textContent;
      button.textContent = 'Added!';
      button.style.backgroundColor = 'var(--success-color)';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
      }, 2000);
      
    } catch (error) {
      console.error("Failed to add to cart", error);
      alert(error.response?.data?.msg || "Something went wrong. Could not add to cart.");
    } finally {
      setLoading(prev => ({ ...prev, cart: false }));
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert("Please log in to add items to your wishlist.");
      return;
    }
    
    setLoading(prev => ({ ...prev, wishlist: true }));
    
    try {
      if (isWishlisted) {
        const { data: updatedWishlist } = await api.delete(`/wishlist/remove/${product._id}`);
        setUser({ ...user, wishlist: updatedWishlist });
        setIsWishlisted(false);
      } else {
        const { data: updatedWishlist } = await api.post('/wishlist/add', { productId: product._id });
        setUser({ ...user, wishlist: updatedWishlist });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Failed to update wishlist", error);
      alert(error.response?.data?.msg || "Something went wrong. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, wishlist: false }));
    }
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="product-image-container">
          <img 
            src={product.imageUrl || 'https://placehold.co/400x400/e9ecef/495057?text=No+Image'} 
            alt={product.name} 
            className="product-image"
            loading="lazy"
          />
          
          {/* Stock Status Badge */}
          {isOutOfStock && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: 'var(--danger-color)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              Out of Stock
            </div>
          )}
          
          {isLowStock && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: '#ffc107',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              Only {product.stock} left
            </div>
          )}

          {/* Wishlist Button Overlay */}
          <button
            onClick={handleToggleWishlist}
            disabled={loading.wishlist}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              opacity: loading.wishlist ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'white';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <Heart 
              size={18} 
              fill={isWishlisted ? 'var(--danger-color)' : 'none'}
              color={isWishlisted ? 'var(--danger-color)' : '#6c757d'}
            />
          </button>

          {/* Quick View Button */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            opacity: 0,
            transition: 'opacity 0.2s ease'
          }} className="quick-view-btn">
            <button style={{
              background: 'rgba(13, 110, 253, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              <Eye size={14} />
              Quick View
            </button>
          </div>
        </div>
      </Link>

      <div className="product-info">
        <span className="product-category" style={{ 
          textTransform: 'capitalize',
          color: 'var(--primary-color)',
          fontSize: '0.8rem',
          fontWeight: '500'
        }}>
          {product.category}
        </span>
        
        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="product-name" style={{ 
            fontSize: '1rem',
            lineHeight: '1.4',
            margin: '0.25rem 0 0.5rem',
            minHeight: '2.8rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.name}
          </h3>
        </Link>

        {/* Rating (placeholder for future feature) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.25rem',
          marginBottom: '0.5rem'
        }}>
          {[1, 2, 3, 4, 5].map(star => (
            <Star 
              key={star}
              size={14} 
              fill="#ffc107" 
              color="#ffc107" 
            />
          ))}
          <span style={{ fontSize: '0.8rem', color: '#6c757d', marginLeft: '0.25rem' }}>
            (4.5)
          </span>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <div className="product-price" style={{ 
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--primary-color)'
          }}>
            ${product.price.toFixed(2)}
          </div>
          
          {product.stock > 0 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              fontSize: '0.8rem',
              color: '#6c757d'
            }}>
              <Package size={12} />
              {product.stock} in stock
            </div>
          )}
        </div>

        <div className="product-actions" style={{ 
          display: 'flex', 
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <button 
            onClick={handleAddToCart}
            disabled={loading.cart || isOutOfStock}
            className="btn btn-primary"
            style={{ 
              flex: 1,
              fontSize: '0.9rem',
              padding: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: isOutOfStock ? 0.5 : 1,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
            }}
          >
            {loading.cart ? (
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid #ffffff40', 
                borderTop: '2px solid #ffffff', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}></div>
            ) : (
              <>
                <ShoppingCart size={16} />
                {isOutOfStock ? 'Sold Out' : 'Add to ttry Cart'}
              </>
            )}
          </button>
        </div>

        {/* Free Shipping Badge */}
        {product.price >= 25 && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.25rem 0.5rem',
            backgroundColor: '#d1ecf1',
            color: '#0c5460',
            fontSize: '0.75rem',
            borderRadius: '0.25rem',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            🚚 Free Shipping
          </div>
        )}
      </div>

      <style jsx>{`
        .product-card:hover .quick-view-btn {
          opacity: 1;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .product-card:hover .product-image {
          transform: scale(1.05);
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .quick-view-btn {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductCard;