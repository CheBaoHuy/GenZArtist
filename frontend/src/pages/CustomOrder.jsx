import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isLoggedIn } from '../auth/session';
import './CustomOrder.css';

const API = 'http://localhost:8080/api/v1';

const STYLES = [
  'Anime / Manga',
  'Chibi',
  'Tả thực (Realistic)',
  'Màu nước (Watercolor)',
  'Pixel Art',
  'Line Art',
  '3D Render',
  'Pop Art',
  'Tối giản (Minimalist)',
  'Fantasy',
];

export default function CustomOrder() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [categories, setCategories] = useState([]);
  const [artists, setArtists] = useState([]);
  const [preview, setPreview] = useState('');

  const [form, setForm] = useState({
    customerName: user?.fullName || '',
    artType: '',
    description: '',
    style: '',
    artistId: '',
    budget: '',
    refImageName: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  /* ── Loại art = danh mục sản phẩm ── */
  useEffect(() => {
    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(res => { if (res.status === 'success') setCategories(res.data || []); })
      .catch(() => {});
  }, []);

  /* ── Hoạ sĩ = tất cả user role SELLER ── */
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API}/users/artists`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(res => {
        if (res.status !== 'success') return;
        setArtists((res.data || []).map(a => ({ id: a.id, name: a.fullName || `Hoạ sĩ #${a.id}` })));
      })
      .catch(() => {});
  }, []);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set('refImageName', file.name);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const isValid =
    form.customerName.trim() &&
    form.artType &&
    form.description.trim() &&
    form.style &&
    form.artistId &&
    Number(form.budget) > 0;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    if (!isLoggedIn()) {
      navigate('/login', { state: { redirect: '/custom-order' } });
      return;
    }
    const token = localStorage.getItem('token');

    const budgetVnd = Math.round(Number(form.budget));
    const finalTotal = budgetVnd; // tổng đơn = ngân sách (VND)
    const artistName = artists.find(a => String(a.id) === String(form.artistId))?.name || '';
    const artTypeName = categories.find(c => String(c.id) === String(form.artType))?.name || '';

    setSubmitting(true);
    setError('');
    try {
      const res = await axios.post(`${API}/orders/custom`, {
        customerName: form.customerName.trim(),
        artType: artTypeName,
        style: form.style,
        description: form.description.trim(),
        artistId: Number(form.artistId),
        budget: budgetVnd,
        paymentMethod: 'VNPAY',
      }, { headers: { Authorization: `Bearer ${token}` } });

      const orderId = res?.data?.data?.orderId;
      if (!orderId) throw new Error('Không nhận được mã đơn hàng.');

      navigate('/checkout', {
        state: {
          orderId,
          finalTotal,
          discount: 0,
          discountAmt: 0,
          shipping: 0,
          customOrder: {
            customerName: form.customerName.trim(),
            artType: artTypeName,
            description: form.description.trim(),
            style: form.style,
            artistName,
            budgetVnd,
            refImageName: form.refImageName,
          },
        },
      });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Tạo đơn thất bại.';
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="custom-order-page">
      {/* ── NAVBAR ── */}
      <nav className="prd-nav">
        <span className="nav-logo">🎨 </span>
        <Link to="/" className="prd-nav-logo"> <span>GenZArtist</span></Link>
        <div className="prd-nav-center"></div>
        <div className="prd-nav-right">
          <Link to="/products" className="prd-nav-btn outline">← Sản phẩm</Link>
          {user
            ? <Link to="/profile" className="prd-nav-btn outline">{user.fullName}</Link>
            : <Link to="/login" className="prd-nav-btn solid">Đăng nhập</Link>}
        </div>
      </nav>

      <div className="co-wrap">
        <header className="co-head">
          <h1 className="co-title">✏️ Đặt đơn vẽ theo yêu cầu</h1>
          <p className="co-subtitle">
            Mô tả ý tưởng của bạn, chọn hoạ sĩ phù hợp — chúng tôi sẽ biến nó thành tác phẩm.
          </p>
        </header>

        <form className="cof-card" onSubmit={handleSubmit}>
          <div className="cof-grid">
            <div className="cof-field">
              <label>Tên người đặt</label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.customerName}
                onChange={e => set('customerName', e.target.value)}
              />
            </div>

            <div className="cof-field">
              <label>Loại art</label>
              <select value={form.artType} onChange={e => set('artType', e.target.value)}>
                <option value="">— Chọn loại art —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="cof-field">
              <label>Chọn style</label>
              <select value={form.style} onChange={e => set('style', e.target.value)}>
                <option value="">— Chọn style —</option>
                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="cof-field">
              <label>Chọn hoạ sĩ</label>
              <select value={form.artistId} onChange={e => set('artistId', e.target.value)}>
                <option value="">— Chọn hoạ sĩ —</option>
                {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div className="cof-field">
              <label>Ngân sách dự kiến (₫)</label>
              <input
                type="number"
                min="0"
                placeholder="500000"
                value={form.budget}
                onChange={e => set('budget', e.target.value)}
              />
            </div>

            <div className="cof-field full">
              <label>Mô tả nội dung</label>
              <textarea
                rows={5}
                placeholder="Mô tả chi tiết nội dung, bố cục, màu sắc, cảm xúc bạn muốn thể hiện…"
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            <div className="cof-field full">
              <label>Ảnh minh hoạ (tham khảo)</label>
              <div className="cof-upload">
                <label className="cof-upload-btn">
                  📎 Chọn ảnh
                  <input type="file" accept="image/*" hidden onChange={handleImage} />
                </label>
                {form.refImageName && <span className="cof-upload-name">{form.refImageName}</span>}
              </div>
              {preview && <img src={preview} alt="preview" className="cof-preview" />}
            </div>
          </div>

          {error && <p className="cof-error">⚠️ {error}</p>}

          <button type="submit" className="cof-submit" disabled={!isValid || submitting}>
            {submitting ? 'Đang tạo đơn…' : 'Tiếp tục thanh toán →'}
          </button>
        </form>
      </div>
    </div>
  );
}
