import React, { useState } from 'react';
import axios from 'axios';

const AuthModal = ({ isOpen, onClose , onSuccess}) => {
  const [isLogin, setIsLogin] = useState(true); // Switch giữa Login và Register
  const [formData, setFormData] = useState({ username: '', password: '' });

  if (!isOpen) return null; // Nếu không mở thì không vẽ gì cả

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post(`http://localhost:8080/api/auth/login`, formData);
    const token = res.data;
    localStorage.setItem("token", token);

    // Thay vì alert, ta gọi hàm onSuccess được truyền từ Navbar
    onSuccess("Chào mừng thợ săn trở lại!");

    // Đợi 2 giây cho user kịp đọc rồi mới reload
    setTimeout(() => {
      window.location.reload(); 
    }, 2000);

  } catch (err) {
    onSuccess("Sai cmnr, check lại đi!"); // Dùng chung toast cho lỗi cũng được
  }
};
  return (
    
    <div style={overlayStyle}>
      <section className="nes-container is-dark with-title" style={modalStyle}>
        <h3 className="title">{isLogin ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"}</h3>
        
        {/* Nút chuyển đổi Tab */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            type="button" 
            className={`nes-btn is-small ${isLogin ? 'is-primary' : ''}`}
            onClick={() => setIsLogin(true)}
          >Login</button>
          <button 
            type="button" 
            className={`nes-btn is-small ${!isLogin ? 'is-success' : ''}`}
            onClick={() => setIsLogin(false)}
          >Register</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="nes-field" style={{ marginBottom: '15px' }}>
            <label>Username</label>
            <input 
              type="text" className="nes-input is-dark" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required 
            />
          </div>

          <div className="nes-field" style={{ marginBottom: '20px' }}>
            <label>Password</label>
            <input 
              type="password" className="nes-input is-dark" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>

          <menu className="dialog-menu" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="nes-btn" onClick={onClose}>Hủy</button>
            <button type="submit" className={`nes-btn ${isLogin ? 'is-primary' : 'is-success'}`}>
              {isLogin ? "Vào Game" : "Tạo Account"}
            </button>
          </menu>
        </form>
      </section>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(12, 12, 13, 0.33)', display: 'flex', justifyContent: 'center',
  alignItems: 'center', zIndex: 2000
};

const modalStyle = { width: '400px', backgroundColor: '#83b5e6' };

export default AuthModal;