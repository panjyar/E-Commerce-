import React from "react";
import { useAuth } from "../hooks/useAuth";
import ProductCard from "../components/ProductCard";
import ClickSpark from "../components/ClickSpark";
const WishlistPage = () => {
  const { user } = useAuth();

  if (!user || !user.wishlist || user.wishlist.length === 0) {
    return (
      <div className="empty-page-message">
        <h2>Your Wishlist is Empty</h2>
        <p>Looks like you haven't added anything to your wishlist yet.</p>
      </div>
    );
  }

  return (
    <div>
      <ClickSpark
        sparkColor="#fff"
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <h1 className="page-title">My Wishlist</h1>
        <div className="product-grid">
          {user.wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </ClickSpark>
    </div>
  );
};

export default WishlistPage;
