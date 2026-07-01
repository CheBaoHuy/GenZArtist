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
  }


  if (loading) return <div>Đang tải hồ sơ...</div>;
  if (!profile) return <div>Không tìm thấy hồ sơ</div>;

  if (loading) return <div className="loading-screen">Đang tải trang cá nhân...</div>;
  if (!profile) return <div className="error-screen">Không thể tải thông tin người dùng. Vui lòng <a href="/login">đăng nhập</a> lại.</div>;

  return (
    <div className="profile-page">
      <nav className="pf-nav">
        <Link to="/" className="pf-nav-logo">🎨 <span>GenZArtist</span></Link>
        <div className="pf-nav-right">
          <Link to="/" className="pf-nav-link">Trang chủ</Link>
          {getRole === 'BUYER' &&
              <Link className="pf-nav-link" to="/orders">📦 Đơn hàng của tôi</Link>}
          {getRole === 'SELLER' &&
              <Link className="pf-nav-link" to="/seller/orders">🎨 Đơn vẽ được đặt</Link>}
          {getRole === 'ADMIN' ?
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
            <button className="more-btn" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </div>


            {isEditing ? (
              <div className="profile-edit-modal" onClick={() => setIsEditing(false)}>
                <div className="profile-edit-panel" onClick={(e) => e.stopPropagation()}>
                  <form className="profile-edit-form" onSubmit={handleUpdateProfile}>
                  <label>
                    Họ và tên
                    <input name="fullName" value={formData.fullName} onChange={handleChange} />
                  </label>
                  <label>
                    Số điện thoại
                    <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                  </label>
                  <label>
                    Ảnh đại diện
                    <input name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} />
                  </label>
                  <label>
                    Địa chỉ
                    <input name="address" value={formData.address} onChange={handleChange} />
                  </label>

                  <div className="form-actions">
                  <button type="submit">Lưu</button>
                  <button type="button" onClick={() => setIsEditing(false)}>Huỷ</button>
                </div>
                </form>
              </div>
              </div>
              ) : null}
            <button className="more-btn" onClick={handleLogout}>Đăng xuất</button>
          </div>
        )}

        {/* Các chỉ số thống kê - Cần API để lấy dữ liệu này */}
        <div className="profile-stats">
          {[
            { label: 'Tác phẩm', value: profile.works ? profile.works.toLocaleString() : '0' },
            { label: 'Người theo dõi', value: profile.followers ? (profile.followers / 1000).toFixed(1) + 'k' : '0' },
            { label: 'Đang theo dõi', value: profile.following ?? 0 },
            { label: 'Tổng lượt thích', value: profile.likes ? (profile.likes / 1000).toFixed(1) + 'k' : '0' },
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
              {t === 'works' ? `🖼️ Tác phẩm (${profile.works})` :
               t === 'collections' ? `📁 Bộ sưu tập` : '👤 Giới thiệu'}
            </button>
          ))}
        </div>
      </div>

      <div className="profile-content">

        {/* Works tab */}
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

        {/* Collections tab */}
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

        {/* About tab */}
        {tab === 'about' && (
          <div className="about-section">
            <div className="about-card">
              <h3>Giới thiệu</h3>
              <p>Xin chào! Mình là Luna, một hoạ sĩ kỹ thuật số sống tại Hà Nội, Việt Nam. Mình chuyên về tranh minh hoạ kỹ thuật số phong cách neon, concept art và tác phẩm có hỗ trợ AI. Mình đã sáng tạo nghệ thuật số hơn 4 năm và yêu thích khám phá sự giao thoa giữa công nghệ và sáng tạo.</p>
            </div>
            <div className="about-card">
              <h3>Kỹ năng</h3>
              <div className="skill-tags">
                {['Photoshop','Procreate','Midjourney','After Effects','Figma','Blender'].map(s => (
                  <span className="skill-tag" key={s}>{s}</span>
                ))}
              </div>
            </div>
            <div className="about-card">
              <h3>Liên kết mạng xã hội</h3>
              <div className="about-links">
                <a href="#s" className="about-link">𝕏 @luna_exe</a>
                <a href="#s" className="about-link">📸 @luna.exe</a>
                <a href="#s" className="about-link">🎵 @lunaexe</a>
                <a href="#s" className="about-link">💬 luna#2024</a>
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