import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import axios from 'axios';

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirm: '', role: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    const response = await axios.post(
      'http://localhost:8080/api/v1/auth/register',
      payload
    );

    // nếu backend trả data đăng ký thành công
    console.log('Register success', response.data);

    // chuyển trang đến login
    navigate('/login');
  } catch (error) {
    console.error('Register failed', error);
    // hiển thị lỗi cho người dùng ở đây
  } finally {
    setIsLoading(false);
  }
};

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  const strengthColor = ['', '#ff4d6d', '#ffd166', '#06d6a0', '#4cc9f0'];
  const strength = passwordStrength();

  return (
    <div className="auth-wrapper">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <div className="auth-container register-container">
        {/* Left panel */}
        <div className="auth-brand-panel">
          <div className="brand-content">
            <div className="brand-logo">
              <span className="logo-icon">🎨</span>
            </div>
            <h1 className="brand-name">GenZArtist</h1>
            <p className="brand-tagline">Gia nhập cộng đồng hàng nghìn nhà sáng tạo Gen Z</p>
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-icon">✦</span>
                <span>Tham gia miễn phí, trọn đời</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✦</span>
                <span>Đăng tải tác phẩm không giới hạn</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✦</span>
                <span>Xây dựng portfolio sáng tạo của riêng bạn</span>
              </div>
            </div>

            {/* Step indicator */}
            <div className="step-indicator">
              <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
              <div className="step-line"></div>
              <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
            </div>
            <p className="step-label">Bước {step} / 2</p>
          </div>
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-form-panel">
          {step === 1 && (
            <>
              <div className="form-header">
                <h2>Tạo tài khoản ✨</h2>
                <p>Hãy bắt đầu với thông tin cơ bản của bạn</p>
              </div>

              <div className="social-login">
                <button className="social-btn google-btn" type="button">
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.7-3.4-11.3-8H6.3C9.7 35.6 16.3 44 24 44z"/>
                    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.2 5.2C37 38.1 44 33 44 24c0-1.3-.1-2.6-.4-3.9z"/>
                  </svg>
                  Tiếp tục với Google
                </button>
              </div>

              <div className="divider"><span>hoặc đăng ký bằng email</span></div>

              <form className="auth-form" onSubmit={handleNext}>
                <div className="input-group">
                  <label htmlFor="reg-username">Họ và tên</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🧑‍🎨</span>
                    <input
                      id="reg-fullname"
                      type="text"
                      name="fullName"
                      placeholder="Họ và tên của bạn"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="reg-email">Email</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📧</span>
                    <input
                      id="reg-email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn">Tiếp tục →</button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-header">
                <h2>Đặt mật khẩu 🔐</h2>
                <p>Hãy đặt mật khẩu đủ mạnh để bảo vệ tài khoản của bạn</p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="reg-password">Mật khẩu</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Tối thiểu 8 ký tự"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                    />
                    <button type="button" className="toggle-pass" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="strength-bar">
                      {[1,2,3,4].map(i => (
                        <div
                          key={i}
                          className="strength-segment"
                          style={{ background: i <= strength ? strengthColor[strength] : '#2a2a3e' }}
                        ></div>
                      ))}
                      <span className="strength-text" style={{ color: strengthColor[strength] }}>
                        {strengthLabel[strength]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="reg-confirm">Xác nhận mật khẩu</label>
                  <div className="input-wrapper">
                    <span className="input-icon">✅</span>
                    <input
                      id="reg-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      name="confirm"
                      placeholder="Nhập lại mật khẩu của bạn"
                      value={formData.confirm}
                      onChange={handleChange}
                      required
                    />
                    <button type="button" className="toggle-pass" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {formData.confirm && formData.password !== formData.confirm && (
                    <p className="input-error">Mật khẩu không khớp</p>
                  )}
                </div>

                {/* Role selector */}
                <div className="input-group">
                  <label>Tôi là...</label>
                  <div className="role-selector">
                    {[
                      { value: 'SELLER', label: 'Hoạ sĩ', icon: '🎨' },
                      { value: 'BUYER', label: 'Người mua', icon: '🌟' },
                    ].map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        className={`role-btn ${formData.role === r.value ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, role: r.value })}
                      >
                        {r.icon} {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="terms-row">
                  <input type="checkbox" id="terms" required />
                  <label htmlFor="terms">
                    Tôi đồng ý với <a href="#terms" className="forgot-link">Điều khoản dịch vụ</a> và{' '}
                    <a href="#privacy" className="forgot-link">Chính sách bảo mật</a>
                  </label>
                </div>

                <div className="btn-row">
                  <button type="button" className="back-btn" onClick={() => setStep(1)}>← Quay lại</button>
                  <button
                    type="submit"
                    className={`submit-btn ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading || formData.password !== formData.confirm}
                  >
                    {isLoading ? <span className="spinner"></span> : 'Tạo tài khoản'}
                  </button>
                </div>
              </form>
            </>
          )}

          <p className="switch-auth">
            Đã có tài khoản?{' '}
            <Link to="/login" className="switch-link">Đăng nhập →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
