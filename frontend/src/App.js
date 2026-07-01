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

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <UserProvider>
          <Routes>
            <Route path="/"                   element={<Home />}          />
            <Route path="/login"              element={<Login />}         />
            <Route path="/register"           element={<Register />}      />
            <Route path="/profile"            element={<Profile />}       />
            <Route path="/artwork/:id"        element={<ArtworkDetail />} />
            <Route path="/products"           element={<Products />}      />
          <Route path="/cart"               element={<Cart />}          />
          <Route path="/checkout"           element={<Checkout />}      />
          <Route path="/auth/callback"      element={<AuthCallback />}  /> 
          <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
          {/*<Route path="/admin/*"            element={<Manager />}       />*/}
          <Route path="*"                   element={<Navigate to="/" replace />} />
        </Routes>
        </UserProvider>
      </BrowserRouter>
    </CartProvider>
  );
}
export default App;