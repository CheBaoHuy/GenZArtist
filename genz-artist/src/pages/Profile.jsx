import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Profile.css';

/* ── Mock data ─────────────────────────────────────── */
const PROFILE = {
  username: 'luna.exe',
  displayName: 'Luna.exe',
  bio: '🎨 Digital artist & UI designer. I paint with code and pixels. Open for commissions ✨',
  location: 'Hà Nội, Vietnam',
  website: 'luna-art.io',
  joined: 'March 2024',
  followers: 28400,
  following: 312,
  works: 142,
  likes: 89200,
  verified: true,
  coverGrad: 'linear-gradient(135deg,#560bad 0%,#f72585 50%,#4cc9f0 100%)',
  avatarGrad: 'linear-gradient(135deg,#f72585,#7209b7)',
};

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
  const { username } = useParams();
  const [tab, setTab] = useState('works');
  const [followed, setFollowed] = useState(false);
  const [likedIds, setLikedIds] = useState([]);

  const toggleLike = (id) =>
    setLikedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div className="profile-page">

      {/* ── NAVBAR ── */}
      <nav className="pf-nav">
        <Link to="/" className="pf-nav-logo">🎨 <span>GenZArtist</span></Link>
        <div className="pf-nav-right">
          <Link to="/" className="pf-nav-link">Home</Link>
          <Link to="/login" className="pf-nav-btn outline">Sign In</Link>
          <Link to="/register" className="pf-nav-btn solid">Join Free</Link>
        </div>
      </nav>

      {/* ── COVER ── */}
      <div className="profile-cover" style={{ background: PROFILE.coverGrad }}>
        <div className="cover-overlay"></div>
      </div>

      {/* ── HEADER ── */}
      <div className="profile-header-wrap">
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" style={{ background: PROFILE.avatarGrad }}>
              <span>L</span>
            </div>
            {PROFILE.verified && <div className="profile-verified">✓</div>}
          </div>

          <div className="profile-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{PROFILE.displayName}</h1>
              <span className="profile-username">@{username || PROFILE.username}</span>
            </div>
            <p className="profile-bio">{PROFILE.bio}</p>
            <div className="profile-meta">
              <span>📍 {PROFILE.location}</span>
              <a href={`https://${PROFILE.website}`} className="profile-web">🔗 {PROFILE.website}</a>
              <span>📅 Joined {PROFILE.joined}</span>
            </div>
          </div>

          <div className="profile-actions">
            <button
              className={`follow-main-btn ${followed ? 'following' : ''}`}
              onClick={() => setFollowed(!followed)}
            >
              {followed ? '✓ Following' : '+ Follow'}
            </button>
            <button className="msg-btn">💬 Message</button>
            <button className="more-btn">···</button>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="profile-stats">
          {[
            { label: 'Works',     value: PROFILE.works.toLocaleString() },
            { label: 'Followers', value: (PROFILE.followers / 1000).toFixed(1) + 'k' },
            { label: 'Following', value: PROFILE.following },
            { label: 'Total Likes', value: (PROFILE.likes / 1000).toFixed(1) + 'k' },
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
              {t === 'works' ? `🖼️ Works (${PROFILE.works})` :
               t === 'collections' ? `📁 Collections` : '👤 About'}
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
                  <span className="col-count">{col.count} works</span>
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
              <h3>About Me</h3>
              <p>Hi! I'm Luna, a digital artist based in Hà Nội, Vietnam. I specialize in neon-infused digital illustrations, concept art, and AI-assisted artwork. I've been creating digital art for over 4 years and love exploring the intersection of technology and creativity.</p>
            </div>
            <div className="about-card">
              <h3>Skills</h3>
              <div className="skill-tags">
                {['Photoshop','Procreate','Midjourney','After Effects','Figma','Blender'].map(s => (
                  <span className="skill-tag" key={s}>{s}</span>
                ))}
              </div>
            </div>
            <div className="about-card">
              <h3>Social Links</h3>
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
        <p>© 2026 GenZArtist · <Link to="/">Home</Link> · <a href="#terms">Terms</a> · <a href="#privacy">Privacy</a></p>
      </footer>
    </div>
  );
}
