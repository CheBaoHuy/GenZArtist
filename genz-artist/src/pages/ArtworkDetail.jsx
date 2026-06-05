import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './ArtworkDetail.css';

/* ── Mock data ─────────────────────────────────────── */
const ARTWORKS_DB = {
  1: { title:'Neon Dreams',     artist:'Luna.exe',    handle:'luna.exe',  grad:'linear-gradient(135deg,#f72585,#7209b7)', tag:'Digital',  likes:2841, views:'18.2k', date:'May 28, 2026', desc:'A dreamlike exploration of neon-soaked cityscapes and digital emotions. This piece was created using Photoshop and Midjourney as a base reference, blending my signature purple-pink palette with futuristic aesthetics.' },
  2: { title:'Void Walker',     artist:'DarkPixel',   handle:'darkpixel', grad:'linear-gradient(135deg,#3a0ca3,#4cc9f0)', tag:'Concept',  likes:1923, views:'11.4k', date:'May 20, 2026', desc:'A lone figure traverses the infinite void between dimensions. Created entirely in Procreate over 12 hours.' },
  3: { title:'Cherry Blossom AI',artist:'Sakura.psd', handle:'sakura.psd',grad:'linear-gradient(135deg,#ff6b6b,#ffd93d)', tag:'AI Art',   likes:3512, views:'24.1k', date:'May 15, 2026', desc:'Blending traditional Japanese aesthetics with AI-generated textures. A love letter to spring.' },
  4: { title:'Cyber Temple',    artist:'GlitchGod',   handle:'glitchgod', grad:'linear-gradient(135deg,#06d6a0,#118ab2)', tag:'Pixel',    likes:987,  views:'7.8k',  date:'May 10, 2026', desc:'Pixel art meets brutalist architecture. Built in Aseprite, 64x64 canvas, scaled up with love.' },
  5: { title:'Astral Drift',    artist:'cosm0s.art',  handle:'cosm0s',    grad:'linear-gradient(135deg,#560bad,#f72585)', tag:'Abstract', likes:4210, views:'31.0k', date:'May 5, 2026',  desc:'An abstract journey through cosmic consciousness. No plan, just flow — painted in one session.' },
};

const RELATED = [
  { id:2, title:'Void Walker',    grad:'linear-gradient(135deg,#3a0ca3,#4cc9f0)', likes:1923 },
  { id:3, title:'Cherry Blossom', grad:'linear-gradient(135deg,#ff6b6b,#ffd93d)', likes:3512 },
  { id:5, title:'Astral Drift',   grad:'linear-gradient(135deg,#560bad,#f72585)', likes:4210 },
  { id:4, title:'Cyber Temple',   grad:'linear-gradient(135deg,#06d6a0,#118ab2)', likes:987  },
];

const COMMENTS = [
  { id:1, user:'DarkPixel',  grad:'linear-gradient(135deg,#3a0ca3,#4cc9f0)', time:'2h ago',  text:'Absolutely stunning palette! The way you blend the pinks and purples is magical 🔥' },
  { id:2, user:'Sakura.psd', grad:'linear-gradient(135deg,#ff6b6b,#ffd93d)', time:'5h ago',  text:'This deserves way more attention. Top 10 digital pieces of 2026 for me.' },
  { id:3, user:'cosm0s.art', grad:'linear-gradient(135deg,#560bad,#f72585)', time:'1d ago',  text:'Incredible work as always Luna 🌸 collab soon??' },
  { id:4, user:'PetalRiot',  grad:'linear-gradient(135deg,#06d6a0,#f72585)', time:'2d ago',  text:'Saved this to 4 different collections lol. Can\'t get enough of this energy.' },
];

export default function ArtworkDetail() {
  const { id } = useParams();
  const art = ARTWORKS_DB[id] || ARTWORKS_DB[1];

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(COMMENTS);
  const [followed, setFollowed] = useState(false);

  const handleComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComments([{
      id: Date.now(), user: 'You',
      grad: 'linear-gradient(135deg,#a855f7,#6366f1)',
      time: 'Just now', text: comment,
    }, ...comments]);
    setComment('');
  };

  const tags = ['digital art', 'neon', 'cyberpunk', 'illustration', 'genz', art.tag.toLowerCase()];

  return (
    <div className="detail-page">

      {/* ── NAVBAR ── */}
      <nav className="dt-nav">
        <Link to="/" className="dt-nav-logo">🎨 <span>GenZArtist</span></Link>
        <div className="dt-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/profile/${art.handle}`}>{art.artist}</Link>
          <span>/</span>
          <span className="dt-bc-current">{art.title}</span>
        </div>
        <div className="dt-nav-right">
          <Link to="/login" className="dt-nav-btn outline">Sign In</Link>
          <Link to="/register" className="dt-nav-btn solid">Join Free</Link>
        </div>
      </nav>

      <div className="detail-layout">

        {/* ── LEFT: ARTWORK ── */}
        <div className="detail-main">

          {/* Canvas */}
          <div className="artwork-canvas" style={{ background: art.grad }}>
            <div className="canvas-watermark">GenZArtist</div>
          </div>

          {/* Action bar */}
          <div className="artwork-action-bar">
            <div className="action-left">
              <button
                className={`action-btn like-action ${liked ? 'active' : ''}`}
                onClick={() => setLiked(!liked)}
              >
                {liked ? '❤️' : '🤍'}
                <span>{art.likes + (liked ? 1 : 0)}</span>
              </button>
              <button className="action-btn">
                💬 <span>{comments.length}</span>
              </button>
              <button className="action-btn">
                👁️ <span>{art.views}</span>
              </button>
            </div>
            <div className="action-right">
              <button
                className={`action-btn save-btn ${saved ? 'active' : ''}`}
                onClick={() => setSaved(!saved)}
              >
                {saved ? '🔖' : '📌'} {saved ? 'Saved' : 'Save'}
              </button>
              <button className="action-btn">↗️ Share</button>
            </div>
          </div>

          {/* Info */}
          <div className="artwork-detail-info">
            <div className="detail-title-row">
              <div>
                <h1 className="detail-title">{art.title}</h1>
                <div className="detail-meta-row">
                  <span className="detail-tag">{art.tag}</span>
                  <span className="detail-date">📅 {art.date}</span>
                </div>
              </div>
            </div>
            <p className="detail-desc">{art.desc}</p>
            <div className="detail-tags">
              {tags.map(t => (
                <span key={t} className="detail-hashtag">#{t}</span>
              ))}
            </div>
          </div>

          {/* ── COMMENTS ── */}
          <div className="comments-section">
            <h3 className="comments-title">💬 Comments ({comments.length})</h3>

            <form className="comment-form" onSubmit={handleComment}>
              <div className="comment-avatar-you" style={{ background:'linear-gradient(135deg,#a855f7,#6366f1)' }}>Y</div>
              <div className="comment-input-wrap">
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Add a comment…"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
                <button type="submit" className="comment-submit" disabled={!comment.trim()}>Post</button>
              </div>
            </form>

            <div className="comments-list">
              {comments.map(c => (
                <div className="comment-item" key={c.id}>
                  <div className="comment-avatar" style={{ background: c.grad }}>{c.user[0]}</div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <span className="comment-user">{c.user}</span>
                      <span className="comment-time">{c.time}</span>
                    </div>
                    <p className="comment-text">{c.text}</p>
                    <div className="comment-actions">
                      <button className="comment-react">❤️ Like</button>
                      <button className="comment-react">↩ Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="detail-sidebar">

          {/* Artist card */}
          <div className="sidebar-card artist-sidebar-card">
            <div className="sidebar-artist-avatar" style={{ background: 'linear-gradient(135deg,#f72585,#7209b7)' }}>
              <span>L</span>
            </div>
            <div className="sidebar-artist-info">
              <p className="sidebar-artist-name">{art.artist}</p>
              <p className="sidebar-artist-handle">@{art.handle}</p>
              <div className="sidebar-artist-stats">
                <span>142 works</span> · <span>28.4k followers</span>
              </div>
            </div>
            <div className="sidebar-artist-btns">
              <button
                className={`sidebar-follow-btn ${followed ? 'following' : ''}`}
                onClick={() => setFollowed(!followed)}
              >
                {followed ? '✓ Following' : '+ Follow'}
              </button>
              <Link to={`/profile/${art.handle}`} className="sidebar-profile-link">View Profile →</Link>
            </div>
          </div>

          {/* Details card */}
          <div className="sidebar-card">
            <h4 className="sidebar-card-title">📋 Artwork Details</h4>
            <div className="sidebar-details">
              {[
                { label:'Category', value: art.tag },
                { label:'Published', value: art.date },
                { label:'Views', value: art.views },
                { label:'Likes', value: (art.likes + (liked ? 1 : 0)).toLocaleString() },
                { label:'License', value: 'All rights reserved' },
              ].map(d => (
                <div className="sidebar-detail-row" key={d.label}>
                  <span className="sd-label">{d.label}</span>
                  <span className="sd-value">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related */}
          <div className="sidebar-card">
            <h4 className="sidebar-card-title">🔗 More Like This</h4>
            <div className="related-list">
              {RELATED.filter(r => r.id !== parseInt(id)).slice(0,3).map(r => (
                <Link to={`/artwork/${r.id}`} key={r.id} className="related-item">
                  <div className="related-thumb" style={{ background: r.grad }}></div>
                  <div className="related-info">
                    <p className="related-title">{r.title}</p>
                    <p className="related-likes">❤️ {r.likes.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
