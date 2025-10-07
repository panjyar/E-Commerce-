import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';
import ClickSpark from "../components/ClickSpark";
const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, setUser } = useAuth();

 useEffect(() => {
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Showing dummy product (API not available).');
      // fallback dummy product
      setProduct({
        _id: "dummy123",
        name: "Wireless Headphones",
        category: "Electronics",
        price: 49.99,
        description: "High-quality wireless headphones with noise cancellation.",
        imageUrl: "https://placehold.co/600x600/ced4da/212529?text=Dummy+Product"
      });
    } finally {
      setLoading(false);
    }
  };
  fetchProduct();
}, [id]);


  const handleAddToCart = async () => {
    if (!user) {
        alert("Please log in to add items to your cart.");
        return;
    }
    try {
      const { data: updatedCart } = await api.post('/cart/add', { productId: product._id, quantity });
      setUser({ ...user, cart: updatedCart });
      alert(`${quantity} x ${product.name} added to cart!`);
    } catch (error) {
        console.error("Failed to add to cart", error);
        alert("Something went wrong. Could not add to cart.");
    }
  };

  if (loading) return <p>Loading product details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!product) return null;

  return (
    <div className="product-detail-layout">
      <ClickSpark
  sparkColor='#fff'
  sparkSize={10}
  sparkRadius={15}
  sparkCount={8}
  duration={400}
>

      <img 
        src={product.imageUrl || 'https://placehold.co/600x600/e9ecef/495057?text=No+Image'} 
        alt={product.name} 
        className="product-detail-image"
      />
      <div className="product-detail-info">
        <span className="product-category">{product.category}</span>
        <h1>{product.name}</h1>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <p>{product.description}</p>
        
        <div className="quantity-selector">
          <label htmlFor="quantity">Quantity:</label>
          <input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="form-control"
          />
        </div>

        <button onClick={handleAddToCart} className="btn btn-primary">
          Add to Cart
        </button>
      </div>
      </ClickSpark>
    </div>
  );
};

export default ProductDetailPage;
