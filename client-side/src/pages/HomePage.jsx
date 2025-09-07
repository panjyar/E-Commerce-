import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import api from '../api/axiosConfig';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ 
    category: '', 
    price_min: '', 
    price_max: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query params from state, excluding empty values
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          params.append(key, value.trim());
        }
      });
      
      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // Initial load

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  
  const applyFilters = (e) => {
    e.preventDefault();
    fetchProducts(); // Refetch with new filters
  };

  const clearFilters = () => {
    setFilters({ category: '', price_min: '', price_max: '', search: '' });
    // Refetch products after clearing filters
    setTimeout(fetchProducts, 0);
  };

  if (error) {
    return (
      <div className="error-message">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchProducts} className="btn btn-primary">Try Again</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="hero-section" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '4rem 2rem', 
        borderRadius: '1rem', 
        marginBottom: '3rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '700' }}>
          Welcome to ShopSphere
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
          Discover amazing products at unbeatable prices. Your one-stop shop for everything you need.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section" style={{ marginBottom: '2rem' }}>
        <form onSubmit={applyFilters} className="search-form" style={{ 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '1rem'
        }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#6c757d' 
              }} 
            />
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search products..."
              className="form-control"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          
          <button 
            type="button" 
            onClick={() => setShowFilters(!showFilters)} 
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Filter size={18} /> Filters
          </button>
          
          <button type="submit" className="btn btn-primary">Search</button>
          
          {(filters.search || filters.category || filters.price_min || filters.price_max) && (
            <button type="button" onClick={clearFilters} className="btn btn-secondary">
              <X size={18} /> Clear
            </button>
          )}
        </form>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="filter-panel" style={{ 
            background: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <label htmlFor="category" className="form-label">Category</label>
              <input
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder="e.g., electronics"
                className="form-control"
              />
            </div>
            
            <div>
              <label htmlFor="price_min" className="form-label">Min Price</label>
              <input
                id="price_min"
                name="price_min"
                type="number"
                min="0"
                value={filters.price_min}
                onChange={handleFilterChange}
                placeholder="0"
                className="form-control"
              />
            </div>
            
            <div>
              <label htmlFor="price_max" className="form-label">Max Price</label>
              <input
                id="price_max"
                name="price_max"
                type="number"
                min="0"
                value={filters.price_max}
                onChange={handleFilterChange}
                placeholder="1000"
                className="form-control"
              />
            </div>
          </div>
        )}
      </div>

      {/* Products Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2>
            {filters.search || filters.category || filters.price_min || filters.price_max 
              ? 'Search Results' 
              : 'All Products'
            }
          </h2>
          <span style={{ color: '#6c757d' }}>
            {loading ? 'Loading...' : `${products.length} products found`}
          </span>
        </div>

        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '300px' 
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
        ) : products.length === 0 ? (
          <div className="empty-page-message">
            <h3>No products found</h3>
            <p>Try adjusting your search criteria or browse all products.</p>
            {(filters.search || filters.category || filters.price_min || filters.price_max) && (
              <button onClick={clearFilters} className="btn btn-primary">
                View All Products
              </button>
            )}
          </div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #495057;
        }

        @media (max-width: 768px) {
          .search-form {
            flex-direction: column;
          }
          
          .search-form > div {
            width: 100%;
          }
          
          .filter-panel {
            grid-template-columns: 1fr;
          }
          
          .hero-section h1 {
            font-size: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;