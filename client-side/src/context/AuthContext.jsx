import { createContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || null);
  const [loading, setLoading] = useState(true); // To check initial auth state

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          // Use the '/api/auth/me' route we created
          const { data } = await api.get('/auth/me');
          setUser(data); // User data (including persistent cart/wishlist)
        } catch (error) {
          // Token is invalid or expired
          console.error('Failed to fetch user', error);
          logout(); // Clear bad token
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('authToken', data.token);
    setToken(data.token);
    // User state will update via useEffect
  };

  const signup = async (email, password) => {
    const { data } = await api.post('/auth/register', { email, password });
    localStorage.setItem('authToken', data.token);
    setToken(data.token);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;