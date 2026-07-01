import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';
import { authService } from '../auth/authService';

// Mock data, bạn sẽ thay thế bằng dữ liệu thật từ API
const ARTWORKS = [];
const COLLECTIONS = [];

export default function Profile() {
  const [user] = useState(authService.getUser());
  
  const logout = () => {
    authService.logout();
    window.location.href = '/login';
  };
  
  console.log('User in Profile:', user);
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
    alert('Chức năng đang được phát triển');
    setIsEditing(false);
  };

  const toggleLike = (id) => {
    setLikedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  if (!user) return <div className="loading-screen">Đang tải trang cá nhân...</div>;

  return (
    <div className="profile-page">
      <nav className="pf-nav">
        <Link to="/" className="pf-nav-logo">🎨 <span>GenZArtist</span></Link>
        <div className="pf-nav-right">
          <Link to="/" className="pf-nav-link">Trang chủ</Link>
          {user.role === 'BUYER' &&
              <Link className="pf-nav-link" to="/orders">📦 Đơn hàng của tôi</Link>}
          {user.role === 'SELLER' &&
              <Link className="pf-nav-link" to="/seller/orders">🎨 Đơn vẽ được đặt</Link>}
          {user.role === 'ADMIN' ?
              <li id={"manager_navigate"} className="menu-item">
                <Link className="pf-nav-link" to={"/admin"}>Quản lý</Link>
              </li> : ""}
        </div>
      </nav>

      <div className="profile-cover" style={{ background: 'linear-gradient(135deg,#560bad 0%,#f72585 50%,#4cc9f0 100%)' }}>
        <div className="cover-overlay"></div>
      </div>

      <div className="profile-header-wrap">
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" style={{ background: 'linear-gradient(135deg,#f72585,#7209b7)' }}>
              {user.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName} /> : <span>{user.fullName?.charAt(0)}</span>}
            </div>
          </div>

          <div className="profile-info">
             <div className="profile-name-row">
               <h1 className="profile-name">{user.fullName}</h1>
               <span className="profile-username">@{user.username || 'username'}</span>
             </div>
             <p className="profile-bio">{user.bio || 'Chưa có tiểu sử'}</p>
             <div className="profile-meta">
               <span>📍 {user.address || 'Chưa cập nhật'}</span>
               <span>📅 Đã tham gia {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
             </div>
           </div>

          <div className="profile-actions">
            <button
              className={`follow-main-btn ${followed ? 'following' : ''}`}
              onClick={() => setFollowed(!followed)}
            >
              {followed ? '✓ Đang theo dõi' : '+ Theo dõi'}
            </button>
            <button className="msg-btn">💬 Nhắn tin</button>
            <button className="more-btn" onClick={() => setIsEditing(true)}>
              Chỉnh sửa hồ sơ
            </button>
            <button className="more-btn" onClick={logout}>Đăng xuất</button>
          </div>
        </div>

        {isEditing && (
          <div className="profile-edit-modal" onClick={() => setIsEditing(false)}>
            <div className="profile-edit-panel" onClick={(e) => e.stopPropagation()}>
              <form className="profile-edit-form" onSubmit={handleUpdateProfile}>
              <label>
                Họ và tên
                <input name="fullName" defaultValue={user.fullName} onChange={handleChange} />
              </label>
              <label>
                Số điện thoại
                <input name="phoneNumber" defaultValue={user.phoneNumber} onChange={handleChange} />
              </label>
              <label>
                Ảnh đại diện
                <input name="avatarUrl" defaultValue={user.avatarUrl} onChange={handleChange} />
              </label>
              <label>
                Địa chỉ
                <input name="address" defaultValue={user.address} onChange={handleChange} />
              </label>

              <div className="form-actions">
              <button type="submit">Lưu</button>
              <button type="button" onClick={() => setIsEditing(false)}>Huỷ</button>
            </div>
            </form>
          </div>
          </div>
        )}

        <div className="profile-stats">
          {[
            { label: 'Tác phẩm', value: user.works ? user.works.toLocaleString() : '0' },
            { label: 'Người theo dõi', value: user.followers ? (user.followers / 1000).toFixed(1) + 'k' : '0' },
            { label: 'Đang theo dõi', value: user.following ?? 0 },
            { label: 'Tổng lượt thích', value: user.likes ? (user.likes / 1000).toFixed(1) + 'k' : '0' },
          ].map(s => (
            <div className="pf-stat" key={s.label}>
              <span className="pf-stat-val">{s.value}</span>
              <span className="pf-stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-tabs-wrap">
        <div className="profile-tabs">
          {['works', 'collections', 'about'].map(t => (
            <button
              key={t}
              className={`profile-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'works' ? `🖼️ Tác phẩm (${user.works || 0})` :
               t === 'collections' ? `📁 Bộ sưu tập` : '👤 Giới thiệu'}
            </button>
          ))}
        </div>
      </div>

      <div className="profile-content">

        {tab === 'works' && (
          <div className="works-grid">
            {ARTWORKS.map(art => (
              <Link to={`/artwork/${art.id}`} key={art.id} className="work-card">
                <div className="work-thumb" style={{ background: art.grad }}>
                  <span className="work-tag">{art.tag}</span>
                  <div className="work-hover-info">
                    <span>❤️ {(art.likes + (likedIds.includes(art.id) ? 1 : 0)).toLocaleString()}</span>
                    <span>👁️ {art.views}</span>
                  </div>
                </div>
                <div className="work-footer">
                  <p className="work-title">{art.title}</p>
                  <button
                    className={`work-like ${likedIds.includes(art.id) ? 'liked' : ''}`}
                    onClick={e => { e.preventDefault(); toggleLike(art.id); }}
                  >
                    {likedIds.includes(art.id) ? '❤️' : '🤍'}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === 'collections' && (
          <div className="collections-grid">
            {COLLECTIONS.map(col => (
              <div className="col-card" key={col.id}>
                <div className="col-thumb" style={{ background: col.grad }}>
                  <span className="col-count">{col.count} tác phẩm</span>
                </div>
                <p className="col-name">{col.name}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'about' && (
          <div className="about-section">
            <div className="about-card">
              <h3>Giới thiệu</h3>
              <p>{user.bio || 'Chưa có tiểu sử'}</p>
            </div>
            <div className="about-card">
              <h3>Kỹ năng</h3>
              <div className="skill-tags">
                {user.skills?.map(s => (
                  <span className="skill-tag" key={s}>{s}</span>
                ))}
              </div>
            </div>
            <div className="about-card">
              <h3>Liên kết mạng xã hội</h3>
              <div className="about-links">
                <a href="#s" className="about-link">𝕏 @{user.username}</a>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="pf-footer">
        <p>© 2026 GenZArtist · <Link to="/">Trang chủ</Link> · <a href="#terms">Điều khoản</a> · <a href="#privacy">Bảo mật</a></p>
      </footer>
    </div>
  );
}