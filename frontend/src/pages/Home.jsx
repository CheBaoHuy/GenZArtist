import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

/* ── Mock data ─────────────────────────────────────── */
const ARTWORKS = [
  { id: 1,  title: 'Neon Dreams',        artist: 'Luna.exe',      likes: 2841, gradient: 'linear-gradient(135deg,#f72585,#7209b7)', tag: 'Digital' },
  { id: 2,  title: 'Void Walker',        artist: 'DarkPixel',     likes: 1923, gradient: 'linear-gradient(135deg,#3a0ca3,#4cc9f0)', tag: 'Concept' },
  { id: 3,  title: 'Cherry Blossom AI', artist: 'Sakura.psd',    likes: 3512, gradient: 'linear-gradient(135deg,#ff6b6b,#ffd93d)', tag: 'AI Art'  },
  { id: 4,  title: 'Cyber Temple',      artist: 'GlitchGod',     likes: 987,  gradient: 'linear-gradient(135deg,#06d6a0,#118ab2)', tag: 'Pixel'   },
  { id: 5,  title: 'Astral Drift',      artist: 'cosm0s.art',    likes: 4210, gradient: 'linear-gradient(135deg,#560bad,#f72585)', tag: 'Abstract'},
  { id: 6,  title: 'Lo-Fi City',        artist: 'moodboard_',    likes: 2103, gradient: 'linear-gradient(135deg,#ff9a3c,#ff6b6b)', tag: 'Illus.'  },
  { id: 7,  title: 'Glass Heart',       artist: 'cry.psd',       likes: 1678, gradient: 'linear-gradient(135deg,#4cc9f0,#7209b7)', tag: 'Digital' },
  { id: 8,  title: 'Grunge Bloom',      artist: 'PetalRiot',     likes: 890,  gradient: 'linear-gradient(135deg,#06d6a0,#f72585)', tag: 'Mixed'   },
  { id: 9,  title: 'Midnight Rave',     artist: 'bassline.art',  likes: 3301, gradient: 'linear-gradient(135deg,#240046,#ff6b6b)', tag: 'Digital' },
];

const ARTISTS = [
  { id: 1, name: 'Luna.exe',     tag: '@luna.exe',     works: 142, followers: '28.4k', grad: 'linear-gradient(135deg,#f72585,#7209b7)' },
  { id: 2, name: 'DarkPixel',   tag: '@darkpixel',    works: 89,  followers: '19.2k', grad: 'linear-gradient(135deg,#3a0ca3,#4cc9f0)' },
  { id: 3, name: 'Sakura.psd',  tag: '@sakura.psd',   works: 211, followers: '51.3k', grad: 'linear-gradient(135deg,#ff6b6b,#ffd93d)' },
  { id: 4, name: 'GlitchGod',   tag: '@glitchgod',    works: 67,  followers: '9.8k',  grad: 'linear-gradient(135deg,#06d6a0,#118ab2)' },
  { id: 5, name: 'cosm0s.art',  tag: '@cosm0s',       works: 178, followers: '42.1k', grad: 'linear-gradient(135deg,#560bad,#f72585)' },
  { id: 6, name: 'moodboard_',  tag: '@moodboard_',   works: 94,  followers: '21.0k', grad: 'linear-gradient(135deg,#ff9a3c,#ff6b6b)' },
];

const CATEGORIES = [
  { label: 'Digital Art',   icon: '🖥️', count: '12.4k' },
  { label: 'Illustration',  icon: '✏️', count: '8.9k'  },
  { label: 'AI Generated',  icon: '🤖', count: '5.2k'  },
  { label: 'Pixel Art',     icon: '🕹️', count: '3.7k'  },
  { label: 'Abstract',      icon: '🌀', count: '6.1k'  },
  { label: 'Photography',   icon: '📷', count: '4.8k'  },
  { label: 'Concept Art',   icon: '🧠', count: '2.9k'  },
  { label: 'Mixed Media',   icon: '🎭', count: '1.6k'  },
];

const STATS = [
  { value: '120K+', label: 'Artists'   },
  { value: '2.4M',  label: 'Artworks'  },
  { value: '890K+', label: 'Collectors'},
  { value: '48',    label: 'Countries' },
];

/* ── Component ─────────────────────────────────────── */
export default function Home() {
  const [likedIds, setLikedIds]       = useState([]);
  const [activeTag, setActiveTag]     = useState('All');
  const [menuOpen, setMenuOpen]       = useState(false);
  const token = localStorage.getItem('token');
  const isLoggedIn = Boolean(token);  
  
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const fullName = user?.fullName;


  const tags = ['All', 'Digital', 'AI Art', 'Pixel', 'Abstract', 'Illus.', 'Concept', 'Mixed'];

  const toggleLike = (id) =>
    setLikedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const filtered = activeTag === 'All' ? ARTWORKS : ARTWORKS.filter(a => a.tag === activeTag);

  return (
    <div className="home-page">

      {/* ── NAVBAR ──────────────────────────────────── */}
      <nav className="navbar">
        <div className="nav-logo">
          <span className="nav-logo-icon">🎨</span>
          <span className="nav-logo-text">GenZArtist</span>
        </div>

        <div className="nav-search-wrap">
          <span className="nav-search-icon">🔍</span>
          <input className="nav-search" type="text" placeholder="Search artists, artworks…" />
        </div>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#trending" className="nav-link" onClick={() => setMenuOpen(false)}>Trending</a>
          <a href="#artists"  className="nav-link" onClick={() => setMenuOpen(false)}>Artists</a>
          <a href="#categories" className="nav-link" onClick={() => setMenuOpen(false)}>Explore</a>
          {isLoggedIn ? (
            <Link to="/profile" className="nav-btn outline">{fullName}</Link>
          ) : (
            <>
              <Link to="/login"    className="nav-btn outline" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="nav-btn solid"   onClick={() => setMenuOpen(false)}>Join Free</Link>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </nav>

      {/* ── HERO ────────────────────────────────────── */}
      <section className="hero">
        {/* floating art cards */}
        <div className="hero-card hero-card-1" style={{ background: ARTWORKS[4].gradient }}></div>
        <div className="hero-card hero-card-2" style={{ background: ARTWORKS[0].gradient }}></div>
        <div className="hero-card hero-card-3" style={{ background: ARTWORKS[2].gradient }}></div>
        <div className="hero-card hero-card-4" style={{ background: ARTWORKS[6].gradient }}></div>

        <div className="hero-content">
          <div className="hero-badge">✦ The #1 platform for Gen Z creators</div>
          <h1 className="hero-title">
            Discover Art <br/>
            <span className="gradient-text">Without Limits</span>
          </h1>
          <p className="hero-sub">
            A creative universe built by and for the next generation of artists.
            Share, explore, and get discovered.
          </p>
          <div className="hero-btns">
            <Link to="/register" className="hero-btn-primary">Start Creating →</Link>
            <a href="#trending"  className="hero-btn-secondary">Explore Artworks</a>
          </div>

          <div className="hero-avatars">
            {ARTISTS.slice(0, 5).map(a => (
              <div key={a.id} className="hero-avatar" style={{ background: a.grad }} title={a.name}></div>
            ))}
            <span className="hero-avatar-text">+120K artists joined</span>
          </div>
        </div>
      </section>

      {/* ── TRENDING ARTWORKS ───────────────────────── */}
      <section className="section" id="trending">
        <div className="section-header">
          <div>
            <div className="section-label">🔥 Hot right now</div>
            <h2 className="section-title">Trending Artworks</h2>
          </div>
          <div className="tag-filters">
            {tags.map(t => (
              <button
                key={t}
                className={`tag-btn ${activeTag === t ? 'active' : ''}`}
                onClick={() => setActiveTag(t)}
              >{t}</button>
            ))}
          </div>
        </div>

        <div className="artworks-grid">
          {filtered.map(art => (
            <div className="artwork-card" key={art.id}>
              <div className="artwork-thumb" style={{ background: art.gradient }}>
                <div className="artwork-overlay">
                  <button className="artwork-view-btn">View Full ↗</button>
                </div>
                <span className="artwork-tag">{art.tag}</span>
              </div>
              <div className="artwork-info">
                <div className="artwork-meta">
                  <div>
                    <p className="artwork-title">{art.title}</p>
                    <p className="artwork-artist">by {art.artist}</p>
                  </div>
                  <button
                    className={`like-btn ${likedIds.includes(art.id) ? 'liked' : ''}`}
                    onClick={() => toggleLike(art.id)}
                    aria-label="Like"
                  >
                    {likedIds.includes(art.id) ? '❤️' : '🤍'}
                    <span>{art.likes + (likedIds.includes(art.id) ? 1 : 0)}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="center-btn">
          <button className="load-more-btn">Load More Artworks ↓</button>
        </div>
      </section>

      {/* ── FEATURED ARTISTS ────────────────────────── */}
      <section className="section section-dark" id="artists">
        <div className="section-header">
          <div>
            <div className="section-label">⭐ Top Creators</div>
            <h2 className="section-title">Featured Artists</h2>
          </div>
          <a href="#artists" className="see-all-link">See all artists →</a>
        </div>

        <div className="artists-scroll">
          {ARTISTS.map(a => (
            <div className="artist-card" key={a.id}>
              <div className="artist-avatar" style={{ background: a.grad }}>
                <span className="artist-initial">{a.name[0]}</span>
              </div>
              <div className="artist-verified">✓</div>
              <p className="artist-name">{a.name}</p>
              <p className="artist-handle">{a.tag}</p>
              <div className="artist-stats">
                <div>
                  <span className="stat-value">{a.works}</span>
                  <span className="stat-label">Works</span>
                </div>
                <div className="stat-divider"></div>
                <div>
                  <span className="stat-value">{a.followers}</span>
                  <span className="stat-label">Followers</span>
                </div>
              </div>
              <button className="follow-btn">Follow</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────── */}
      <section className="section" id="categories">
        <div className="section-header">
          <div>
            <div className="section-label">🗂️ Browse</div>
            <h2 className="section-title">Explore by Category</h2>
          </div>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map(c => (
            <button className="category-card" key={c.label}>
              <span className="cat-icon">{c.icon}</span>
              <span className="cat-label">{c.label}</span>
              <span className="cat-count">{c.count} works</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────── */}
      <section className="stats-section">
        <div className="stats-glow"></div>
        <div className="stats-inner">
          <p className="stats-eyebrow">Trusted by creators worldwide</p>
          <h2 className="stats-heading">The GenZArtist Community</h2>
          <div className="stats-grid">
            {STATS.map(s => (
              <div className="stat-item" key={s.label}>
                <span className="stat-big">{s.value}</span>
                <span className="stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to share your art?</h2>
          <p className="cta-sub">Join the fastest-growing art community for Gen Z. It's free, forever.</p>
          <Link to="/register" className="cta-btn">Create Your Profile →</Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span>🎨</span> GenZArtist
            </div>
            <p className="footer-tagline">Where creativity meets the next generation.</p>
            <div className="footer-socials">
              <a href="#social" className="social-icon" aria-label="Twitter">𝕏</a>
              <a href="#social" className="social-icon" aria-label="Instagram">📸</a>
              <a href="#social" className="social-icon" aria-label="TikTok">🎵</a>
              <a href="#social" className="social-icon" aria-label="Discord">💬</a>
            </div>
          </div>
          <div className="footer-links-group">
            <div className="footer-col">
              <p className="footer-col-title">Platform</p>
              <a href="#f">Browse Art</a>
              <a href="#f">Artists</a>
              <a href="#f">Collections</a>
              <a href="#f">Challenges</a>
            </div>
            <div className="footer-col">
              <p className="footer-col-title">Creator</p>
              <a href="#f">Upload Art</a>
              <a href="#f">Portfolio</a>
              <a href="#f">Analytics</a>
              <a href="#f">Commissions</a>
            </div>
            <div className="footer-col">
              <p className="footer-col-title">Company</p>
              <a href="#f">About</a>
              <a href="#f">Blog</a>
              <a href="#f">Careers</a>
              <a href="#f">Contact</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 GenZArtist. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#f">Privacy</a>
            <a href="#f">Terms</a>
            <a href="#f">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
