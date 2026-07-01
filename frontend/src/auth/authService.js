import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const authService = {
  login: (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.role) {
      localStorage.setItem('role', userData.role);
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    delete axios.defaults.headers.common['Authorization'];
  },
  getUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
  getToken: () => {
    return localStorage.getItem('token');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
