import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';
import './SellerOrders.css';

const API = 'http://localhost:8080/api/v1';
const STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const STATUS_LABEL = {
  PENDING: 'Chờ xử lý', PROCESSING: 'Đang thực hiện',
  COMPLETED: 'Hoàn tất', CANCELLED: 'Đã huỷ',
};

function OrderCard({ order, onSaved }) {
  const co = order.customOrder || {};
  const [progress, setProgress] = useState(order.progress || 0);
  const [resultImage, setResultImage] = useState(order.resultImageUrl || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [err, setErr] = useState('');

  const hasImage = !!resultImage;

  const save = async (value) => {
    if (value === 100 && !hasImage) {
      setErr('Cần upload hình kết quả trước khi đánh dấu hoàn thành 100%.');
      return;
    }
    const prev = progress;
    setProgress(value);
    setSaving(true);
    setErr('');
    setSavedAt(false);
    try {
      const res = await axios.put(`${API}/seller/custom-orders/${order.orderId}/progress`, { progress: value });
      const data = res.data?.data;
      setSavedAt(true);
      onSaved?.(order.orderId, data?.progress ?? value, data?.orderStatus);
      setTimeout(() => setSavedAt(false), 1800);
    } catch (e) {
      setProgress(prev); // rollback nếu lỗi
      setErr(e?.response?.data?.message || 'Lưu thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr('');
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await axios.put(`${API}/seller/custom-orders/${order.orderId}/result-image`, { imageUrl: reader.result });
        setResultImage(reader.result);
      } catch (ex) {
        setErr(ex?.response?.data?.message || 'Upload hình thất bại.');
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => { setUploading(false); setErr('Không đọc được file.'); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="ord-card">
      <div className="ord-card-head">
        <div>
          <span className="ord-id">#{order.orderId}</span>
          <span className="ord-tag">✏️ {[co.artType, co.style].filter(Boolean).join(' · ') || 'Đơn vẽ'}</span>
        </div>
        <span className={`ord-status ${String(order.orderStatus).toLowerCase()}`}>
          {STATUS_LABEL[order.orderStatus] || order.orderStatus}
        </span>
      </div>

      <div className="ord-custom">
        <div className="ord-row"><span>Khách đặt</span><strong>{co.customerName || order.buyer?.fullName || '—'}</strong></div>
        <div className="ord-row"><span>Email</span><strong>{order.buyer?.email || '—'}</strong></div>
        {co.description && <p className="ord-desc">“{co.description}”</p>}
      </div>

      {/* Upload hình kết quả — bắt buộc trước khi đặt 100% */}
      <div className="so-upload">
        <label className="so-upload-btn">
          {uploading ? '⏳ Đang upload…' : hasImage ? '🔄 Đổi hình kết quả' : '📤 Upload hình kết quả'}
          <input type="file" accept="image/*" hidden disabled={uploading} onChange={handleUpload} />
        </label>
        {hasImage && <img src={resultImage} alt="kết quả" className="so-result-thumb" />}
      </div>

      <div className="ord-progress">
        <div className="ord-progress-head">
          <span>Tiến độ {saving ? '(đang lưu…)' : savedAt ? '✓ đã lưu' : ''}</span>
          <strong>{progress}%</strong>
        </div>
        <div className="ord-progress-track">
          <div className="ord-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="so-steps">
        {STEPS.map(s => {
          const locked = s === 100 && !hasImage;
          return (
            <button
              key={s}
              className={`so-step ${s === progress ? 'active' : ''} ${s <= progress ? 'reached' : ''}`}
              disabled={saving || locked}
              title={locked ? 'Cần upload hình kết quả trước' : ''}
              onClick={() => save(s)}
            >
              {s === 100 && locked ? '🔒' : s}
            </button>
          );
        })}
      </div>
      {!hasImage && <p className="so-hint">🔒 Upload hình kết quả để mở khoá mốc 100%.</p>}
      {err && <p className="so-err">⚠️ {err}</p>}

      <div className="ord-foot">
        <div className="ord-foot-cell">
          <span>Tổng tiền</span>
          <strong>{Number(order.totalAmount).toLocaleString('vi-VN')}₫</strong>
        </div>
        <div className="ord-foot-cell">
          <span>Ngày đặt</span>
          <strong>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}</strong>
        </div>
      </div>
    </div>
  );
}

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    axios.get(`${API}/seller/custom-orders`, { params: { page: 1, size: 50 } })
      .then(res => setOrders(res.data?.data?.orders || []))
      .catch(() => setError('Không thể tải danh sách đơn.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = useCallback((orderId, progress, orderStatus) => {
    setOrders(prev => prev.map(o => o.orderId === orderId
      ? { ...o, progress, orderStatus: orderStatus || o.orderStatus }
      : o));
  }, []);

  return (
    <div className="orders-page">
      <nav className="prd-nav">
        <span className="nav-logo">🎨 </span>
        <Link to="/" className="prd-nav-logo"> <span>GenZArtist</span></Link>
        <div className="prd-nav-center"></div>
        <div className="prd-nav-right">
          <Link to="/profile" className="prd-nav-btn outline">{user?.fullName || 'Hoạ sĩ'}</Link>
        </div>
      </nav>

      <div className="ord-wrap">
        <header className="ord-head">
          <h1 className="ord-title">🎨 Đơn vẽ được đặt cho tôi</h1>
          <p className="ord-subtitle">Cập nhật tiến độ theo bước 10% — khách hàng sẽ thấy ngay.</p>
        </header>

        {loading ? (
          <div className="ord-state"><div className="prd-spinner" /><p>Đang tải…</p></div>
        ) : error ? (
          <div className="ord-state"><p>{error}</p></div>
        ) : orders.length === 0 ? (
          <div className="ord-state"><p>😶 Chưa có đơn vẽ nào được đặt cho bạn.</p></div>
        ) : (
          <div className="ord-list">
            {orders.map(o => <OrderCard key={o.orderId} order={o} onSaved={handleSaved} />)}
          </div>
        )}
      </div>
    </div>
  );
}
