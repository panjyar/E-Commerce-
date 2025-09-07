import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const cartItemCount = user?.cart?.reduce((count, item) => count + item.quantity, 0) || 0;
  const wishlistItemCount = user?.wishlist?.length || 0;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">ShopSphere</Link>
      
      {/* Main navigation links can be added here if desired */}
      {/* <ul className="nav-links"> ... </ul> */}

      <ul className="nav-actions">
        {user ? (
          <>
            <li className="nav-link">
              <NavLink to="/wishlist" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="nav-icon">
                  Wishlist
                  {wishlistItemCount > 0 && <span className="nav-badge">{wishlistItemCount}</span>}
                </span>
              </NavLink>
            </li>
            <li className="nav-link">
               <NavLink to="/cart" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="nav-icon">
                  Cart
                  {cartItemCount > 0 && <span className="nav-badge">{cartItemCount}</span>}
                </span>
              </NavLink>
            </li>
            <li className="nav-link">
              <NavLink to="/orders" className={({ isActive }) => isActive ? 'active' : ''}>Orders</NavLink>
            </li>
            <li>
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/auth" className="btn btn-primary">Login / Sign Up</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
