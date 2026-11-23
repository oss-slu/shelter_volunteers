// AuthContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SERVER } from '../config';
import { setUser, removeUser } from '../authentication/user';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    fetch(`${SERVER}/session`, {
      credentials: "include",
      headers: { "X-Volunteer-Session": "1" },
    }).then(async (response) => {
      if (response.status === 401) return;
      if (!response.ok) throw new Error(`Session check failed (HTTP ${response.status})`);
      const { user } = await response.json();
      if (active) {
        setUser(user);
        setIsAuthenticated(true);
      }
    }).catch((error) => {
      console.error("Unable to restore session:", error);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = useCallback(async () => {
    const response = await fetch(`${SERVER}/session`, {
      method: "DELETE",
      credentials: "include",
      headers: { "X-Volunteer-Session": "1" },
    });
    if (!response.ok) throw new Error(`Sign-out failed (HTTP ${response.status})`);
    removeUser();
    setIsAuthenticated(false);
  }, []);

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