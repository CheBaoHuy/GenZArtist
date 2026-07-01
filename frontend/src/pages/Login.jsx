import { useState } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import './Auth.css';
import axios from 'axios';


function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Lấy URL API từ biến môi trường hoặc sử dụng giá trị mặc định
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  const handleSocialLogin = (provider) => {
    window.location.href = `${API_URL}/oauth2/authorization/${provider}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/v1/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      const data = res.data;

      const token = data.token || data.accessToken || data.data?.token || data.data?.accessToken;
      const user = data.user || data.data?.user;

      if (!token) {
        console.log("Login response:", data);
        alert("Backend không trả token");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("accessToken", token);

      if (user?.role) localStorage.setItem("role", user.role);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      navigate("/");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <div className="auth-container">
        <div className="auth-brand-panel">
          <div className="brand-content">
            <div className="brand-logo">
              <span className="logo-icon">🎨</span>
            </div>
            <h1 className="brand-name">GenZArtist</h1>
            <p className="brand-tagline">Where creativity meets the next generation</p>
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-icon">✦</span>
                <span>Showcase your artwork</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✦</span>
                <span>Connect with creators worldwide</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✦</span>
                <span>Get discovered & grow your fanbase</span>
              </div>
            </div>
          </div>
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="form-header">
            <h2>Welcome back 👋</h2>
            <p>Sign in to continue your creative journey</p>
          </div>

          <div className="social-login">
            
            <div className="social-login-buttons">
              <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSocialLogin('google');
                  }}
                  className="social-btn"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                  <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.7-3.4-11.3-8H6.3C9.7 35.6 16.3 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.2 5.2C37 38.1 44 33 44 24c0-1.3-.1-2.6-.4-3.9z"/>
                </svg>
                Google
              </a>
              <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSocialLogin('facebook');
                  }}
                  className="social-btn facebook-btn"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-1.1 0-1.5.9-1.5 1.5V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
                Facebook
              </a>
            </div>
          </div>

          <div className="divider"><span>or sign in with email</span></div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="login-email">Email</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-row">
                <label htmlFor="login-password">Password</label>
                <a href="#forgot" className="forgot-link">Forgot password?</a>
              </div>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : 'Sign In'}
            </button>
          </form>

          <p className="switch-auth">
            Don't have an account?{' '}
            <Link to="/register" className="switch-link">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
