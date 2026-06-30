import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home          from './pages/Home';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Profile       from './pages/Profile';
import ArtworkDetail from './pages/ArtworkDetail';
import Products      from './pages/Products';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import { CartProvider } from './context/CartContext';
// import {Manager} from "./admin/Admin";
import './App.css';
import {Manager} from "./admin/Admin";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                   element={<Home />}          />
          <Route path="/login"              element={<Login />}         />
          <Route path="/register"           element={<Register />}      />
          <Route path="/profile"            element={<Profile />}       />
          <Route path="/artwork/:id"        element={<ArtworkDetail />} />
          <Route path="/products"           element={<Products />}      />
          <Route path="/cart"               element={<Cart />}          />
          <Route path="/checkout"           element={<Checkout />}      />
          <Route path="/admin/*"            element={<Manager />}       />
          <Route path="*"                   element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
