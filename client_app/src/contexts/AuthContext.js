// AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken, removeToken } from '../authentication/getToken';
import { getUser, setUser, removeUser } from '../authentication/user';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const token = getToken();
    const userData = getUser();
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    setToken(token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    removeToken();
    removeUser();
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export logout function for use in fetchClient
let globalLogout = null;

export const setGlobalLogout = (logoutFunction) => {
  globalLogout = logoutFunction;
};

export const getGlobalLogout = () => globalLogout;