import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ArtworkDetail.css';

const API = 'http://localhost:8080/api/v1';

/* ── Stars helper ─────────────────────────────────── */
function Stars({ rating, size = 16 }) {
  return (
      <span className="stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(n => (
          <span key={n} style={{ color: n <= Math.round(rating) ? '#f59e0b' : 'rgba(255,255,255,.18)' }}>★</span>
      ))}
    </span>
  );
}

/* ── StarPicker for review form ─────────────────── */
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
      <div className="star-picker">
        {[1, 2, 3, 4, 5].map(n => (
            <button
                key={n}
                type="button"
                className={`star-btn ${n <= (hover || value) ? 'lit' : ''}`}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => onChange(n)}
            >★</button>
        ))}
        <span className="star-label">
        {value ? ['', 'Tệ', 'Không hay', 'Bình thường', 'Tốt', 'Xuất sắc'][value] : 'Chọn số sao'}
      </span>
      </div>
  );
}

/* ── Format date ─────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function timeAgo(iso) {
  const d = new Date(iso), now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

/* ── Avatar placeholder ─────────────────────────── */
function Avatar({ url, name = '?', size = 40, style = {} }) {
  const initials = (name || '?')[0].toUpperCase();
  const colors = ['#a855f7', '#6366f1', '#ec4899', '#14b8a6', '#f59e0b'];
  const bg = colors[initials.charCodeAt(0) % colors.length];
  if (url) return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', ...style }} />;
  return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.4, color: '#fff', flexShrink: 0, ...style }}>
        {initials}
      </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function ArtworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');

  /* ── State ─────────────────────────────────────── */
  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [reviews, setReviews]     = useState([]);
  const [rvMeta, setRvMeta]       = useState({ avgRating: 0, totalReviews: 0, currentPage: 1, totalPages: 1 });
  const [rvLoading, setRvLoading] = useState(false);

  const [myRating, setMyRating]   = useState(0);
  const [myComment, setMyComment] = useState('');
  const [rvSubmitting, setRvSubmitting] = useState(false);
  const [rvError, setRvError]     = useState('');
  const [rvSuccess, setRvSuccess] = useState('');

  const [saved, setSaved]         = useState(false);
  const [purchaseType, setPurchaseType] = useState('Digital');
  const [related, setRelated]     = useState([]);

  /* ── Fetch product detail ────────────────────── */
  useEffect(() => {
    setLoading(true);
    fetch(`${API}/products/${id}`)
        .then(r => r.json())
        .then(res => {
          if (res.status === 'success') setProduct(res.data);
          else setError('Không tìm thấy sản phẩm.');
        })
        .catch(() => setError('Lỗi kết nối máy chủ.'))
        .finally(() => setLoading(false));
  }, [id]);

  /* ── Fetch related (trending) ────────────────── */
  useEffect(() => {
    fetch(`${API}/products/trending?limit=4`)
        .then(r => r.json())
        .then(res => {
          if (res.status === 'success') {
            setRelated((res.data.products || []).filter(p => String(p.id) !== String(id)));
          }
        })
        .catch(() => {});
  }, [id]);

  /* ── Fetch reviews ───────────────────────────── */
  const fetchReviews = useCallback((page = 1) => {
    setRvLoading(true);
    fetch(`${API}/reviews/product/${id}?page=${page}&size=5`)
        .then(r => r.json())
        .then(res => {
          if (res.status === 'success') {
            const d = res.data;
            if (page === 1) setReviews(d.reviews);
            else setReviews(prev => [...prev, ...d.reviews]);
            setRvMeta({
              avgRating:    d.avgRating,
              totalReviews: d.totalReviews,
              currentPage:  d.pagination.currentPage,
              totalPages:   d.pagination.totalPages,
            });
          }
        })
        .catch(() => {})
        .finally(() => setRvLoading(false));
  }, [id]);

  useEffect(() => { fetchReviews(1); }, [fetchReviews]);

  /* ── Submit review ───────────────────────────── */
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) { navigate('/login'); return; }
    if (!myRating) { setRvError('Vui lòng chọn số sao.'); return; }

    setRvSubmitting(true);
    setRvError('');
    setRvSuccess('');
    try {
      const res = await fetch(`${API}/reviews/product/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: myRating, comment: myComment }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setRvSuccess('Đánh giá của bạn đã được ghi nhận! 🎉');
        setMyRating(0);
        setMyComment('');
        fetchReviews(1); // reload
      } else {
        setRvError(data.message || 'Không thể gửi đánh giá.');
      }
    } catch {
      setRvError('Lỗi kết nối. Thử lại sau.');
    } finally {
      setRvSubmitting(false);
    }
  };

  /* ── Add to cart ─────────────────────────────── */
  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id:     product.id,
      title:  product.name,
      artist: product.seller?.fullName || 'Artist',
      grad:   'linear-gradient(135deg,#a855f7,#6366f1)',
      type:   purchaseType,
      imageUrl: product.imageUrl,
      price:  purchaseType === 'Digital'
          ? parseFloat(product.price)
          : parseFloat(product.price) + 25,
    });
    navigate('/cart');
  };

  /* ── Loading / Error states ─────────────────── */
  if (loading) return (
      <div className="detail-page detail-loading">
        <div className="detail-spinner"></div>
        <p>Đang tải artwork…</p>
      </div>
  );
  if (error || !product) return (
      <div className="detail-page detail-error">
        <p>{error || 'Không tìm thấy sản phẩm.'}</p>
        <Link to="/" className="dt-back-link">← Về trang chủ</Link>
      </div>
  );

  const price    = parseFloat(product.price);
  const avgRating = rvMeta.avgRating || product.avgRating || 0;

  return (
      <div className="detail-page">

        {/* ── NAVBAR ── */}
        <nav className="dt-nav">
          <Link to="/" className="dt-nav-logo">🎨 <span>GenZArtist</span></Link>
          <div className="dt-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Artworks</Link>
            <span>/</span>
            <span className="dt-bc-current">{product.name}</span>
          </div>
          <div className="dt-nav-right">
            <Link to="/cart" className="dt-nav-cart-icon">🛒</Link>
            {user ? (
                <Link to="/profile" className="dt-nav-btn outline">{user.fullName}</Link>
            ) : (
                <>
                  <Link to="/login"    className="dt-nav-btn outline">Sign In</Link>
                  <Link to="/register" className="dt-nav-btn solid">Join Free</Link>
                </>
            )}
          </div>
        </nav>

        <div className="detail-layout">

          {/* ── LEFT: ARTWORK ── */}
          <div className="detail-main">

            {/* Canvas / image */}
            <div className="artwork-canvas">
              {product.imageUrl
                  ? <img src={product.imageUrl} alt={product.name} className="artwork-canvas-img" />
                  : <div className="artwork-canvas-placeholder">🎨</div>
              }
              <div className="canvas-watermark">GenZArtist</div>
            </div>

            {/* Action bar */}
            <div className="artwork-action-bar">
              <div className="action-left">
              <span className="action-btn">
                👁️ <span>{(product.viewCount || 0).toLocaleString()} views</span>
              </span>
                <span className="action-btn">
                ⭐ <span>{avgRating > 0 ? avgRating.toFixed(1) : '—'} ({rvMeta.totalReviews} đánh giá)</span>
              </span>
              </div>
              <div className="action-right">
                <button
                    className={`action-btn save-btn ${saved ? 'active' : ''}`}
                    onClick={() => setSaved(!saved)}
                >
                  {saved ? '🔖' : '📌'} {saved ? 'Đã lưu' : 'Lưu'}
                </button>
                <button className="action-btn" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                  ↗️ Chia sẻ
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="artwork-detail-info">
              <h1 className="detail-title">{product.name}</h1>
              <div className="detail-meta-row">
                {product.category && <span className="detail-tag">{product.category.name}</span>}
                <span className="detail-date">📅 {fmtDate(product.createdAt)}</span>
                {avgRating > 0 && (
                    <span className="detail-rating-inline">
                  <Stars rating={avgRating} size={14} />
                  <span style={{ color: 'rgba(255,255,255,.5)', fontSize: '.78rem', marginLeft: '.3rem' }}>
                    {avgRating.toFixed(1)}
                  </span>
                </span>
                )}
              </div>
              {product.description && (
                  <p className="detail-desc">{product.description}</p>
              )}
            </div>

            {/* ── REVIEWS SECTION ── */}
            <div className="reviews-section">
              <div className="reviews-header">
                <h3 className="reviews-title">⭐ Đánh giá ({rvMeta.totalReviews})</h3>
                {avgRating > 0 && (
                    <div className="reviews-avg">
                      <span className="avg-number">{avgRating.toFixed(1)}</span>
                      <Stars rating={avgRating} size={20} />
                    </div>
                )}
              </div>

              {/* Review form */}
              {token ? (
                  <form className="review-form" onSubmit={handleSubmitReview}>
                    <div className="review-form-inner">
                      <Avatar url={user?.avatarUrl} name={user?.fullName} size={40} />
                      <div className="review-inputs">
                        <StarPicker value={myRating} onChange={setMyRating} />
                        <textarea
                            className="review-textarea"
                            placeholder="Chia sẻ cảm nhận của bạn về tác phẩm này…"
                            value={myComment}
                            onChange={e => setMyComment(e.target.value)}
                            rows={3}
                        />
                        {rvError   && <p className="rv-error">{rvError}</p>}
                        {rvSuccess && <p className="rv-success">{rvSuccess}</p>}
                        <button type="submit" className="review-submit-btn" disabled={rvSubmitting}>
                          {rvSubmitting ? 'Đang gửi…' : 'Gửi đánh giá'}
                        </button>
                      </div>
                    </div>
                  </form>
              ) : (
                  <div className="review-login-prompt">
                    <Link to="/login" className="rv-login-link">Đăng nhập để đánh giá tác phẩm này →</Link>
                  </div>
              )}

              {/* Review list */}
              <div className="reviews-list">
                {rvLoading && reviews.length === 0 && (
                    <p className="rv-loading">Đang tải đánh giá…</p>
                )}
                {!rvLoading && reviews.length === 0 && (
                    <p className="rv-empty">Chưa có đánh giá nào. Hãy là người đầu tiên! 🌟</p>
                )}
                {reviews.map(r => (
                    <div className="review-item" key={r.id}>
                      <Avatar url={r.reviewer?.avatarUrl} name={r.reviewer?.fullName} size={38} />
                      <div className="review-body">
                        <div className="review-item-header">
                          <span className="review-user">{r.reviewer?.fullName || 'Người dùng'}</span>
                          <Stars rating={r.rating} size={13} />
                          <span className="review-time">{timeAgo(r.createdAt)}</span>
                        </div>
                        {r.comment && <p className="review-comment">{r.comment}</p>}
                      </div>
                    </div>
                ))}
              </div>

              {/* Load more reviews */}
              {rvMeta.currentPage < rvMeta.totalPages && (
                  <button
                      className="rv-load-more"
                      onClick={() => fetchReviews(rvMeta.currentPage + 1)}
                      disabled={rvLoading}
                  >
                    {rvLoading ? 'Đang tải…' : 'Xem thêm đánh giá'}
                  </button>
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="detail-sidebar">

            {/* Artist card */}
            <div className="sidebar-card artist-sidebar-card">
              <Avatar url={product.seller?.avatarUrl} name={product.seller?.fullName} size={52} />
              <div className="sidebar-artist-info">
                <p className="sidebar-artist-name">{product.seller?.fullName || 'Artist'}</p>
                <p className="sidebar-artist-handle">@{(product.seller?.fullName || 'artist').toLowerCase().replace(/\s+/g, '.')}</p>
              </div>
            </div>

            {/* Details card */}
            <div className="sidebar-card">
              <h4 className="sidebar-card-title">📋 Thông tin tác phẩm</h4>
              <div className="sidebar-details">
                {[
                  { label: 'Danh mục', value: product.category?.name || '—' },
                  { label: 'Ngày đăng', value: fmtDate(product.createdAt) },
                  { label: 'Lượt xem', value: (product.viewCount || 0).toLocaleString() },
                  { label: 'Đánh giá', value: avgRating > 0 ? `${avgRating.toFixed(1)} ⭐ (${rvMeta.totalReviews})` : 'Chưa có' },
                  { label: 'Bản quyền', value: 'All rights reserved' },
                ].map(d => (
                    <div className="sidebar-detail-row" key={d.label}>
                      <span className="sd-label">{d.label}</span>
                      <span className="sd-value">{d.value}</span>
                    </div>
                ))}
              </div>
            </div>

            {/* Purchase box */}
            <div className="sidebar-card purchase-box">
              <div className="purchase-options">
                <button
                    className={`purchase-opt ${purchaseType === 'Digital' ? 'active' : ''}`}
                    onClick={() => setPurchaseType('Digital')}
                >
                  <span>💾 Bản Digital</span>
                  <span>{price.toLocaleString('vi-VN')}₫</span>
                </button>
                <button
                    className={`purchase-opt ${purchaseType === 'Print' ? 'active' : ''}`}
                    onClick={() => setPurchaseType('Print')}
                >
                  <span>🖼️ Bản In</span>
                  <span>{(price + 25000).toLocaleString('vi-VN')}₫</span>
                </button>
              </div>
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                Thêm vào giỏ hàng
              </button>
              <p className="purchase-note">✓ File gốc độ phân giải cao<br />✓ Giấy phép thương mại tùy chọn</p>
            </div>

            {/* Related artworks */}
            {related.length > 0 && (
                <div className="sidebar-card">
                  <h4 className="sidebar-card-title">🔗 Có thể bạn thích</h4>
                  <div className="related-list">
                    {related.slice(0, 3).map(r => (
                        <Link to={`/artwork/${r.id}`} key={r.id} className="related-item">
                          {r.imageUrl
                              ? <img src={r.imageUrl} alt={r.name} className="related-thumb-img" />
                              : <div className="related-thumb" style={{ background: 'linear-gradient(135deg,#a855f7,#6366f1)' }}></div>
                          }
                          <div className="related-info">
                            <p className="related-title">{r.name}</p>
                            <p className="related-artist">{r.seller?.fullName || ''}</p>
                            <p className="related-price">{parseFloat(r.price).toLocaleString('vi-VN')}₫</p>
                          </div>
                        </Link>
                    ))}
                  </div>
                </div>
            )}
          </aside>
        </div>
      </div>
  );
}
