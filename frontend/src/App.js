import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home          from './pages/Home';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Profile       from './pages/Profile';
import ArtworkDetail from './pages/ArtworkDetail';
import Products      from './pages/Products';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import AuthCallback  from './pages/AuthCallback'; // <-- THÊM DÒNG NÀY
import { CartProvider } from './context/CartContext';

import OAuth2Redirect from './pages/OAuth2Redirect';
import { UserProvider } from './context/UserProvider'; // <-- THÊM DÒNG NÀY
//import {Manager} from "./admin/Admin";
import './App.css';
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ArtworkDetail from "./pages/ArtworkDetail";
import Products from "./pages/Products";
import CustomOrder from "./pages/CustomOrder";
import Orders from "./pages/Orders";
import SellerOrders from "./pages/SellerOrders";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentResult from "./pages/PaymentResult";
import { CartProvider } from "./context/CartContext";
import { Manager } from "./admin/Admin";
import { setupAuthInterceptors } from "./auth/axiosSetup";
import SessionWatcher from "./auth/SessionWatcher";
import ProtectedRoute from "./auth/ProtectedRoute";

setupAuthInterceptors();

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <SessionWatcher />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/artwork/:id" element={<ArtworkDetail />} />
          <Route path="/products" element={<Products />} />
          <Route
            path="/custom-order"
            element={
              <ProtectedRoute>
                <CustomOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute role="BUYER">
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute role="SELLER">
                <SellerOrders />
              </ProtectedRoute>
            }
          />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="/payment-result" element={<PaymentResult />} />
          <Route path="/admin/*" element={<Manager />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </UserProvider>
      </BrowserRouter>
    </CartProvider>
  );
}
export default App;