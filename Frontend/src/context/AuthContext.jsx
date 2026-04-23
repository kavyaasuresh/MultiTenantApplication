import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Initialize axios interceptor ONCE
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          config.headers['Authorization'] = `Bearer ${currentToken}`;
          // Log only in dev mode to avoid cluttering
          if (process.env.NODE_ENV !== 'production') {
            console.log(`Axios Request: ${config.method?.toUpperCase()} ${config.url} | Token: ${currentToken.substring(0, 10)}...`);
          }
        } else {
          console.warn(`Axios Request: ${config.method?.toUpperCase()} ${config.url} | NO TOKEN FOUND`);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  // Update user state when token changes
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          console.warn("Token expired, logging out");
          logout();
        } else {
          setUser({
            username: decoded.sub,
            role: decoded.role,
            tenantId: decoded.tenantId
          });
        }
      } catch (err) {
        console.error("Token decoding failed:", err);
        logout();
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/login'; // Force clear state and redirect
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
