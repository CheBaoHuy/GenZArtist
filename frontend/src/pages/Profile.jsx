import { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Profile.css';
import axios from 'axios';

// Giả sử bạn đã tạo UserContext như đã bàn
// import { UserContext } from '../context/UserContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export default function Profile() {
  // Khi có UserContext, chúng ta sẽ dùng: const { user, logout } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('works');
  const [followed, setFollowed] = useState(false);
  const [likedIds, setLikedIds] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    console.log("Đang cập nhật thông tin:", formData);
    // TODO: Gọi API để cập nhật thông tin người dùng
    // try {
    //   const response = await axios.put(`${API_URL}/api/v1/users/me`, formData);
    //   setProfile(response.data.data);
    //   setIsEditing(false);
    // } catch (error) {
    //   console.error('Lỗi khi cập nhật:', error);
    // }
    alert('Chức năng đang được phát triển');
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  if (loading) return <div className="loading-screen">Đang tải trang cá nhân...</div>;
  if (!profile) return <div className="error-screen">Không thể tải thông tin người dùng. Vui lòng <a href="/login">đăng nhập</a> lại.</div>;

  return (
    <div className="profile-page">
      <nav className="pf-nav">
        <Link to="/" className="pf-nav-logo">🎨 <span>GenZArtist</span></Link>
        <div className="pf-nav-right">
          <Link to="/" className="pf-nav-link">Home</Link>
          {profile.role === 'ADMIN' && (
            <li id="manager_navigate" className="menu-item">
              <Link className="pf-nav-link" to={"/admin"}>Quản lý</Link>
            </li>
          )}
        </div>
      </nav>

      <div className="profile-cover" style={{ background: 'linear-gradient(135deg,#560bad 0%,#f72585 50%,#4cc9f0 100%)' }}>
        <div className="cover-overlay"></div>
      </div>

      <div className="profile-header-wrap">
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" style={{ background: 'linear-gradient(135deg,#f72585,#7209b7)' }}>
              {/* Sử dụng avatarUrl từ profile nếu có */}
              {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.fullName} /> : <span>{profile.fullName?.charAt(0)}</span>}
            </div>
            {/* {profile.verified && <div className="profile-verified">✓</div>} */}
          </div>

          <div className="profile-info">
             <div className="profile-name-row">
               <h1 className="profile-name">{profile.fullName}</h1>
               <span className="profile-username">@{profile.username || 'username'}</span>
             </div>
             <p className="profile-bio">{profile.bio || 'Chưa có tiểu sử'}</p>
             <div className="profile-meta">
               <span>📍 {profile.address || 'Chưa cập nhật'}</span>
               {/* <a href={`https://${profile.website}`} className="profile-web">🔗 {profile.website}</a> */}
               <span>📅 Đã tham gia {new Date(profile.createdAt).toLocaleDateString('vi-VN')}</span>
             </div>
           </div>

          <div className="profile-actions">
            <button className="msg-btn">💬 Nhắn tin</button>
            <button className="more-btn" onClick={() => setIsEditing(true)}>
              Chỉnh sửa
            </button>
            <button className="more-btn" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </div>

        {isEditing && (
          <div className="profile-edit-modal" onClick={() => setIsEditing(false)}>
            <div className="profile-edit-panel" onClick={(e) => e.stopPropagation()}>
              <h3>Chỉnh sửa thông tin</h3>
              <form className="profile-edit-form" onSubmit={handleUpdateProfile}>
                <label>Họ và tên <input name="fullName" value={formData.fullName} onChange={handleChange} /></label>
                <label>Số điện thoại <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} /></label>
                <label>URL ảnh đại diện <input name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} /></label>
                <label>Địa chỉ <input name="address" value={formData.address} onChange={handleChange} /></label>
                <div className="form-actions">
                  <button type="submit">Lưu thay đổi</button>
                  <button type="button" onClick={() => setIsEditing(false)}>Hủy</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Các chỉ số thống kê - Cần API để lấy dữ liệu này */}
        <div className="profile-stats">
          {/* ... */}
        </div>
      </div>

      <div className="profile-tabs-wrap">
        <div className="profile-tabs">
          {['works', 'collections', 'about'].map(t => (
            <button key={t} className={`profile-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="profile-content">
        {tab === 'works' && <div className="empty-state">Chức năng hiển thị tác phẩm đang được phát triển.</div>}
        {tab === 'collections' && <div className="empty-state">Chức năng hiển thị bộ sưu tập đang được phát triển.</div>}
        {tab === 'about' && <div className="about-section">{profile.bio || 'Không có thông tin giới thiệu.'}</div>}
      </div>

      <footer className="pf-footer">
        <p>© 2026 GenZArtist · <Link to="/">Home</Link></p>
      </footer>
    </div>
  );
}