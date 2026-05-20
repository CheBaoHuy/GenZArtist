import React, { useState , useEffect} from 'react';
import { Link } from 'react-router-dom';
import AuthModal from './AuthModal';
import { jwtDecode } from "jwt-decode";


function Navbar() {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  // Thêm vào trong Component Navbar
  const [toastMsg, setToastMsg] = useState("");

  // Hàm "phép thuật" để hiện thông báo 5 giây rồi biến mất
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {W
      setToastMsg("");
    }, 5000); // 5000ms = 5 giây
  };

  // Mỗi khi load trang, kiểm tra xem có token cũ không
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        // KIỂM TRA HẠN ĐĂNG NHẬP (Expiration)
        const currentTime = Date.now() / 1000; // Đổi sang giây
        if (decoded.exp < currentTime) {
          console.warn("Token hết hạn rồi Tài ơi!");
          handleLogout();
        } else {
          setUser(decoded.sub); // Lấy username từ field 'sub'
        }
      } catch (err) {
        console.error("Token lỗi:", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.reload(); // Reload để cập nhật trạng thái
  };


 
  return (
    <>
      <nav className="nes-container is-dark" style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 20px', marginBottom: '20px', borderBottom: '4px solid #fff'
      }}>
        {/* PHẦN BÊN TRÁI: LOGO & ĐIỀU HƯỚNG */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <h1 style={{ fontSize: '18px', margin: 0, color: '#f1c40f' }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>KAIJU WIKI</Link>
          </h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/" className="nes-btn is-small">Home</Link>
            <Link to="/game-info" className="nes-btn is-small is-success">Game Info</Link>
            <Link to="/admin" className="nes-btn is-small is-warning">Admin</Link>
          </div>
        </div>

        {/* PHẦN BÊN PHẢI: XỬ LÝ HIỂN THỊ USER */}
        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span className="nes-text is-primary" style={{ fontSize: '12px' }}>
                Chào, {user}!
              </span>
              <button 
                type="button" 
                className="nes-btn is-error is-small" 
                onClick={handleLogout}
              >
                Out
              </button>
            </div>
          ) : (
            <button 
              type="button" 
              className="nes-btn is-primary is-small" 
              onClick={() => setIsAuthOpen(true)}
            >
              Login/Register
            </button>
          )}
        </div>
      </nav>
      {toastMsg && (
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 3000,
        animation: 'fadeIn 0.5s'
      }}>
        <div className="nes-balloon from-right is-dark">
          <p style={{ color: '#f1c40f', margin: 0, fontSize: '12px' }}>
            {toastMsg}
          </p>
        </div>
      </div>
    )}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={showToast} // Đừng quên truyền hàm này xuống nhé
      />
    </>
  );
}

export default Navbar;
