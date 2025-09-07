import {useEffect , React,  useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import api from "../api/axiosConfig";

const CartPage = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return;
      try {
        const { data } = await api.get("/cart"); // token added automatically
        setUser((prev) => ({ ...prev, cart: data }));
      } catch (err) {
        console.error("Failed to fetch cart", err);
      }
    };

    fetchCart();
  }, [user]);

  const handleQuantityUpdate = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set([...prev, productId]));

    try {
      const { data: updatedCart } = await api.put(`/cart/update/${productId}`, {
        quantity: newQuantity,
      });
      setUser({ ...user, cart: updatedCart });
    } catch (error) {
      console.error("Failed to update quantity", error);
      alert("Failed to update item quantity. Please try again.");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveFromCart = async (productId) => {
    setLoading(true);
    try {
      const { data: updatedCart } = await api.post("/cart/remove", {
        productId,
      });
      setUser({ ...user, cart: updatedCart });
    } catch (error) {
      console.error("Failed to remove item", error);
      alert("Failed to remove item from cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your entire cart?"))
      return;

    setLoading(true);
    try {
      await api.delete("/cart/clear");
      setUser({ ...user, cart: [] });
    } catch (error) {
      console.error("Failed to clear cart", error);
      alert("Failed to clear cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter out invalid cart items (items without product data)
  const validCartItems = user?.cart?.filter(item => item.product) || [];

  // Calculate totals using valid items only
  const subtotal = validCartItems.reduce((acc, item) => {
    return acc + item.product.price * item.quantity;
  }, 0);

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const totalItems = validCartItems.reduce((count, item) => {
    return count + item.quantity;
  }, 0);

  if (!user || !user.cart || validCartItems.length === 0) {
    return (
      <div className="empty-page-message">
        <ShoppingCart
          size={64}
          style={{ color: "#6c757d", marginBottom: "1rem" }}
        />
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          <ShoppingBag size={18} />
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div
        className="page-header cart-grid"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <ShoppingCart size={32} style={{ color: "var(--primary-color)" }} />
          <h1 style={{ margin: 0 }}>Shopping Cart</h1>
          <span
            style={{
              backgroundColor: "var(--primary-color)",
              color: "white",
              padding: "0.25rem 0.75rem",
              borderRadius: "20px",
              fontSize: "0.9rem",
            }}
          >
            {totalItems} items
          </span>
        </div>

        {validCartItems.length > 1 && (
          <button
            onClick={handleClearCart}
            disabled={loading}
            className="btn btn-danger"
            style={{ fontSize: "0.9rem" }}
          >
            <Trash2 size={16} />
            Clear Cart
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: "2rem",
          alignItems: "flex-start",
        }}
      >
        {/* Cart Items */}
        <div
          className="cart-items"
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {validCartItems.map((item) => {
            const isUpdating = updatingItems.has(item.product._id);

            return (
              <div
                key={item.product._id}
                className="cart-item-card"
                style={{
                  border: "1px solid #e9ecef",
                  borderRadius: "var(--border-radius)",
                  padding: "1.5rem",
                  backgroundColor: "white",
                  boxShadow: "var(--box-shadow)",
                  opacity: isUpdating ? 0.7 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                  }}
                >
                  <Link to={`/product/${item.product._id}`}>
                    <img
                      src={
                        item.product.imageUrl ||
                        "https://placehold.co/120x120/e9ecef/495057?text=No+Image"
                      }
                      alt={item.product.name}
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "calc(var(--border-radius) / 2)",
                        border: "1px solid #e9ecef",
                      }}
                    />
                  </Link>

                  <div style={{ flex: 1 }}>
                    <Link
                      to={`/product/${item.product._id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <h3
                        style={{
                          margin: "0 0 0.5rem",
                          fontSize: "1.2rem",
                          lineHeight: "1.4",
                        }}
                      >
                        {item.product.name}
                      </h3>
                    </Link>

                    <p
                      style={{
                        color: "#6c757d",
                        margin: "0 0 1rem",
                        textTransform: "capitalize",
                        fontSize: "0.9rem",
                      }}
                    >
                      {item.product.category}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "1rem",
                      }}
                    >
                      {/* Quantity Controls */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <button
                          onClick={() =>
                            handleQuantityUpdate(
                              item.product._id,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1 || isUpdating}
                          className="btn btn-secondary"
                          style={{
                            width: "36px",
                            height: "36px",
                            padding: "0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Minus size={16} />
                        </button>

                        <span
                          style={{
                            minWidth: "40px",
                            textAlign: "center",
                            fontWeight: "600",
                            fontSize: "1.1rem",
                          }}
                        >
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            handleQuantityUpdate(
                              item.product._id,
                              item.quantity + 1
                            )
                          }
                          disabled={isUpdating}
                          className="btn btn-secondary"
                          style={{
                            width: "36px",
                            height: "36px",
                            padding: "0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Price and Remove */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: "1.3rem",
                              fontWeight: "700",
                              color: "var(--primary-color)",
                            }}
                          >
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                          <div
                            style={{
                              fontSize: "0.9rem",
                              color: "#6c757d",
                            }}
                          >
                            ${item.product.price.toFixed(2)} each
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveFromCart(item.product._id)}
                          disabled={loading}
                          className="btn btn-danger"
                          style={{
                            width: "36px",
                            height: "36px",
                            padding: "0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div
          className="order-summary"
          style={{
            border: "1px solid #e9ecef",
            borderRadius: "var(--border-radius)",
            padding: "1.5rem",
            backgroundColor: "white",
            boxShadow: "var(--box-shadow)",
            position: "sticky",
            top: "20px",
          }}
        >
          <h3 style={{ margin: "0 0 1.5rem", fontSize: "1.4rem" }}>
            Order Summary
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal ({totalItems} items):</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Shipping:</span>
              <span
                style={{
                  color: shipping === 0 ? "var(--success-color)" : "inherit",
                }}
              >
                {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tax:</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            {shipping > 0 && (
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#6c757d",
                  padding: "0.5rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "calc(var(--border-radius) / 2)",
                  marginTop: "0.5rem",
                }}
              >
                Add ${(50 - subtotal).toFixed(2)} more for free shipping!
              </div>
            )}
          </div>

          <div
            style={{
              borderTop: "2px solid #e9ecef",
              paddingTop: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.3rem",
                fontWeight: "700",
              }}
            >
              <span>Total:</span>
              <span style={{ color: "var(--primary-color)" }}>
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="btn btn-primary"
            style={{
              width: "100%",
              height: "50px",
              fontSize: "1.1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            Proceed to Checkout
            <ArrowRight size={20} />
          </Link>

          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              color: "var(--primary-color)",
              textDecoration: "none",
              fontSize: "0.95rem",
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;