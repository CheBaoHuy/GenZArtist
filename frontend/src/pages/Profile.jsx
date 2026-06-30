import { useState, useEffect } from 'react';
import { Link, useParams,  } from 'react-router-dom';
import './Profile.css';
import axios from 'axios';


/* ── Mock data ─────────────────────────────────────── */
// const PROFILE = {
//   username: 'luna.exe',
//   displayName: 'Luna.exe',
//   bio: '🎨 Digital artist & UI designer. I paint with code and pixels. Open for commissions ✨',
//   location: 'Hà Nội, Vietnam',
//   website: 'luna-art.io',
//   joined: 'March 2024',
//   followers: 28400,
//   following: 312,
//   works: 142,
//   likes: 89200,
//   verified: true,
//   coverGrad: 'linear-gradient(135deg,#560bad 0%,#f72585 50%,#4cc9f0 100%)',
//   avatarGrad: 'linear-gradient(135deg,#f72585,#7209b7)',
// };


const ARTWORKS = [
  { id:1,  title:'Neon Dreams',      grad:'linear-gradient(135deg,#f72585,#7209b7)', likes:2841, tag:'Digital',  views:'18.2k' },
  { id:2,  title:'Void Walker',      grad:'linear-gradient(135deg,#3a0ca3,#4cc9f0)', likes:1923, tag:'Concept',  views:'11.4k' },
  { id:3,  title:'Cherry Blossom',   grad:'linear-gradient(135deg,#ff6b6b,#ffd93d)', likes:3512, tag:'AI Art',   views:'24.1k' },
  { id:4,  title:'Cyber Temple',     grad:'linear-gradient(135deg,#06d6a0,#118ab2)', likes:987,  tag:'Pixel',    views:'7.8k'  },
  { id:5,  title:'Astral Drift',     grad:'linear-gradient(135deg,#560bad,#f72585)', likes:4210, tag:'Abstract', views:'31.0k' },
  { id:6,  title:'Lo-Fi City',       grad:'linear-gradient(135deg,#ff9a3c,#ff6b6b)', likes:2103, tag:'Illus.',   views:'15.6k' },
  { id:7,  title:'Glass Heart',      grad:'linear-gradient(135deg,#4cc9f0,#7209b7)', likes:1678, tag:'Digital',  views:'12.3k' },
  { id:8,  title:'Midnight Rave',    grad:'linear-gradient(135deg,#240046,#ff6b6b)', likes:3301, tag:'Digital',  views:'22.0k' },
  { id:9,  title:'Grunge Bloom',     grad:'linear-gradient(135deg,#06d6a0,#f72585)', likes:890,  tag:'Mixed',    views:'6.7k'  },
];

const COLLECTIONS = [
  { id:1, name:'Neon Series',    count:12, grad:'linear-gradient(135deg,#f72585,#7209b7)' },
  { id:2, name:'Cyber Dreams',   count:8,  grad:'linear-gradient(135deg,#3a0ca3,#4cc9f0)' },
  { id:3, name:'Lo-Fi Vibes',    count:15, grad:'linear-gradient(135deg,#ff9a3c,#ff6b6b)' },
  { id:4, name:'Abstract Void',  count:6,  grad:'linear-gradient(135deg,#560bad,#06d6a0)' },
];

export default function Profile() {

  const [tab, setTab] = useState('works');
  const [followed, setFollowed] = useState(false);
  const [likedIds, setLikedIds] = useState([]);

  const getRole = localStorage.getItem("role")
  console.log(getRole)
  const { profileName } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const toggleLike = (id) => {
    setLikedIds(prev => prev.includes(id)
      ? prev.filter(x => x !== id)
      : [...prev, id]
    );
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    avatarUrl: '',
    address: '',
  });
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setLoading(false);

    axios.get('http://localhost:8080/api/v1/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      setProfile(res.data.data || res.data);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        avatarUrl: profile.avatarUrl || '',
        address: profile.address || '',
      });
    }
  }, [profile]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.put('http://localhost:8080/api/v1/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data.data || response.data);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };
  // const handleLogout = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    window.location.href = '/login';
  }


  if (loading) return <div>Đang tải hồ sơ...</div>;
  if (!profile) return <div>Không tìm thấy hồ sơ</div>;


  return (
    <div className="profile-page">

      {/* ── NAVBAR ── */}
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

      {/* ── COVER ── */}
      <div className="profile-cover" style={{ background: profile.coverGrad }}>
        <div className="cover-overlay"></div>
      </div>

      {/* ── HEADER ── */}
      <div className="profile-header-wrap">
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" style={{ background: profile.avatarGrad }}>
              <span>L</span>
            </div>
            {profile.verified && <div className="profile-verified">✓</div>}
          </div>

          {/* <div className="profile-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{profile.displayName}</h1>
              <span className="profile-username">@{profileName || profile.username}</span>
            </div>
            <p className="profile-bio">{profile.bio}</p>
            <div className="profile-meta">
              <span>📍 {profile.location}</span>
              <a href={`https://${profile.website}`} className="profile-web">🔗 {profile.website}</a>
              <span>📅 Joined {profile.joined}</span>
            </div>
          </div> */}

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
        </div>

        {/* ── STATS ── */}
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

      {/* ── TABS ── */}
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

      {/* ── CONTENT ── */}
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

      {/* ── FOOTER ── */}
      <footer className="pf-footer">
        <p>© 2026 GenZArtist · <Link to="/">Trang chủ</Link> · <a href="#terms">Điều khoản</a> · <a href="#privacy">Bảo mật</a></p>
      </footer>
    </div>
  );
}
