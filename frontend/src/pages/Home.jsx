import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const API = 'http://localhost:8080/api/v1';

const ARTISTS = [
  { id: 1, name: 'Luna.exe',     tag: '@luna.exe',     works: 142, followers: '28.4k', grad: 'linear-gradient(135deg,#f72585,#7209b7)' },
  { id: 2, name: 'DarkPixel',   tag: '@darkpixel',    works: 89,  followers: '19.2k', grad: 'linear-gradient(135deg,#3a0ca3,#4cc9f0)' },
  { id: 3, name: 'Sakura.psd',  tag: '@sakura.psd',   works: 211, followers: '51.3k', grad: 'linear-gradient(135deg,#ff6b6b,#ffd93d)' },
  { id: 4, name: 'GlitchGod',   tag: '@glitchgod',    works: 67,  followers: '9.8k',  grad: 'linear-gradient(135deg,#06d6a0,#118ab2)' },
  { id: 5, name: 'cosm0s.art',  tag: '@cosm0s',       works: 178, followers: '42.1k', grad: 'linear-gradient(135deg,#560bad,#f72585)' },
  { id: 6, name: 'moodboard_',  tag: '@moodboard_',   works: 94,  followers: '21.0k', grad: 'linear-gradient(135deg,#ff9a3c,#ff6b6b)' },
];

const CATEGORY_ICONS = {
  '2D Concept Art': '🖌️',
  '3D Models':      '🧊',
  'Anime & Chibi':  '🌸',
  'Pixel Art':      '🕹️',
  'Digital Art':    '🖥️',
  'Illustration':   '✏️',
  'Abstract':       '🌀',
  'Photography':    '📷',
};

const STATS = [
  { value: '120K+', label: 'Artists'   },
  { value: '2.4M',  label: 'Artworks'  },
  { value: '890K+', label: 'Collectors'},
  { value: '48',    label: 'Countries' },
];

/* ── Stars ── */
function Stars({ rating }) {
  return (
      <span>
      {[1,2,3,4,5].map(n => (
          <span key={n} style={{ color: n <= Math.round(rating) ? '#f59e0b' : 'rgba(255,255,255,.18)', fontSize: 12 }}>★</span>
      ))}
    </span>
  );
}

/* ── Component ─────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]       = useState(false);

  const token = localStorage.getItem('token');
  const isLoggedIn = Boolean(token);  
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const fullName = user?.fullName;

  /* ── Data from API ── */
  const [trending,   setTrending]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  /* ── Fetch trending products ── */
  useEffect(() => {
    fetch(`${API}/products/trending?limit=6`)
        .then(r => r.json())
        .then(res => {
          if (res.status === 'success') setTrending(res.data.products || []);
        })
        .catch(() => {})
        .finally(() => setTrendingLoading(false));
  }, []);

  /* ── Fetch categories ── */
  useEffect(() => {
    fetch(`${API}/categories`)
        .then(r => r.json())
        .then(res => {
          if (res.status === 'success') setCategories(res.data || []);
        })
        .catch(() => {});
  }, []);

  /* ── Navigate to Products with category filter ── */
  const goToCategory = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

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
          <Link to="/products" className="nav-link" onClick={() => setMenuOpen(false)}>Explore</Link>
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
        <div className="hero-card hero-card-1" style={{ background: 'linear-gradient(135deg,#560bad,#f72585)' }}></div>
        <div className="hero-card hero-card-2" style={{ background: 'linear-gradient(135deg,#f72585,#7209b7)' }}></div>
        <div className="hero-card hero-card-3" style={{ background: 'linear-gradient(135deg,#ff6b6b,#ffd93d)' }}></div>
        <div className="hero-card hero-card-4" style={{ background: 'linear-gradient(135deg,#4cc9f0,#7209b7)' }}></div>

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
        </div>
      </section>

      {/* ── TRENDING ARTWORKS ───────────────────────── */}
      <section className="section" id="trending">
        <div className="section-header">
          <div>
            <div className="section-label">🔥 Hot right now</div>
            <h2 className="section-title">Trending Artworks</h2>
          </div>
        </div>

        {trendingLoading ? (
            <div className="home-loading">
              <div className="home-spinner"></div>
            </div>
        ) : trending.length === 0 ? (
            <p style={{ color:'rgba(255,255,255,.35)', textAlign:'center', padding:'3rem 0' }}>
              Chưa có sản phẩm nào.
            </p>
        ) : (
            <div className="artworks-grid">
              {trending.map(art => (
                  <Link to={`/artwork/${art.id}`} className="artwork-card" key={art.id}>
                    <div className="artwork-thumb">
                      {art.imageUrl
                          ? <img src={art.imageUrl} alt={art.name} className="artwork-thumb-img" />
                          : <div className="artwork-thumb-placeholder">🎨</div>
                      }
                      <div className="artwork-overlay">
                        <span className="artwork-view-btn">View ↗</span>
                      </div>
                      {art.category && <span className="artwork-tag">{art.category.name}</span>}
                    </div>
                    <div className="artwork-info">
                      <div className="artwork-meta">
                        <div>
                          <p className="artwork-title">{art.name}</p>
                          <p className="artwork-artist">by {art.seller?.fullName || 'Artist'}</p>
                          {art.avgRating > 0 && (
                              <div className="artwork-rating">
                                <Stars rating={art.avgRating} />
                                <span className="artwork-rating-val">{art.avgRating.toFixed(1)}</span>
                              </div>
                          )}
                        </div>
                        <div className="artwork-price">
                          {parseFloat(art.price).toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                    </div>
                  </Link>
              ))}
            </div>
        )}

        <div className="center-btn">
          <Link to="/products" className="load-more-btn">
            Load More Artworks →
          </Link>
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
          <Link to="/products" className="see-all-link">Xem tất cả →</Link>
        </div>

        {categories.length === 0 ? (
            <div className="categories-grid">
              {/* Skeleton placeholders */}
              {[1,2,3,4].map(n => (
                  <div key={n} className="category-card skeleton"></div>
              ))}
            </div>
        ) : (
            <div className="categories-grid">
              {categories.map(c => (
                  <button
                      key={c.id}
                      className="category-card"
                      onClick={() => goToCategory(c.id)}
                  >
                    <span className="cat-icon">{CATEGORY_ICONS[c.name] || '🎨'}</span>
                    <span className="cat-label">{c.name}</span>
                    {c.description && (
                        <span className="cat-desc">{c.description.slice(0, 50)}…</span>
                    )}
                  </button>
              ))}
            </div>
        )}
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
