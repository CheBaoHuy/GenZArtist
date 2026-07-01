
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('accessToken', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      localStorage.removeItem('accessToken');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get(`${API_URL}/api/v1/users/profile`);
          setUser(response.data.data);
          
        } catch (error) {
          console.error('Failed to fetch user', error);
          setToken(null); // Clear invalid token
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = (userData, newToken) => {
    setUser(userData);
    setToken(newToken);
    if (userData.role) {
      localStorage.setItem('role', userData.role);
    }
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    setToken
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
}; 
