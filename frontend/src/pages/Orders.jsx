import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { vnd } from '../utils/currency';
import './Orders.css';

const API = 'http://localhost:8080/api/v1';

const STATUS_LABEL = {
  PENDING: 'Chờ xử lý',
  ACCEPTED: 'Đang thực hiện',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã huỷ',
};
const PHASE_LABEL = {
  UNPAID: 'Chưa thanh toán',
  DEPOSIT_PAID: 'Đã cọc 30%',
  FULLY_PAID: 'Đã thanh toán đủ',
};

function ProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div className="ord-progress">
      <div className="ord-progress-head">
        <span>Tiến độ thực hiện</span>
        <strong>{v}%</strong>
      </div>
      <div className="ord-progress-track">
        <div className="ord-progress-fill" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function OrderCard({ order, onClosed }) {
  const co = order.customOrder;
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  const isCustom   = order.isCustomOrder;
  const phase      = order.paymentPhase;
  const progress   = order.progress || 0;
  const hasImage   = !!co?.hasResultImage;
  const closed     = order.orderStatus === 'COMPLETED';

  // Thanh toán 70% còn lại qua VNPay
  const payRemaining = async () => {
    setBusy('pay'); setErr('');
    try {
      localStorage.setItem('genz_pending_payment', JSON.stringify({
        finalTotal: order.totalAmount,
        deposit: order.depositAmount,
        remaining: order.remainingAmount,
        orderId: order.orderId,
      }));
      const res = await axios.get(`${API}/payment/vnpay/create`, {
        params: { orderId: order.orderId, phase: 'remaining' },
      });
      const url = res?.data?.data?.paymentUrl;
      if (url) window.location.href = url;
      else { setBusy(''); setErr('Không tạo được URL thanh toán VNPay.'); }
    } catch (e) {
      setBusy(''); setErr(e?.response?.data?.message || 'Lỗi tạo thanh toán.');
    }
  };

  // Tải hình kết quả (chỉ được sau khi trả đủ 100%)
  const downloadImage = async () => {
    setBusy('dl'); setErr('');
    try {
      const res = await axios.get(`${API}/orders/${order.orderId}/result-image`);
      const dataUrl = res?.data?.data?.resultImageUrl;
      if (!dataUrl) throw new Error('Không có hình.');
      const ext = (dataUrl.match(/^data:image\/(\w+)/)?.[1]) || 'png';
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `artwork-${order.orderId}.${ext}`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Tải hình thất bại.');
    } finally {
      setBusy('');
    }
  };

  // Buyer xác nhận hoàn tất -> đóng đơn
  const close = async () => {
    setBusy('close'); setErr('');
    try {
      await axios.put(`${API}/orders/${order.orderId}/close`);
      onClosed?.(order.orderId);
    } catch (e) {
      setBusy(''); setErr(e?.response?.data?.message || 'Không đóng được đơn.');
    }
  };

  return (
    <div className="ord-card">
      <div className="ord-card-head">
        <div>
          <span className="ord-id">#{order.orderId}</span>
          {isCustom && <span className="ord-tag">✏️ Đơn vẽ theo yêu cầu</span>}
        </div>
        <span className={`ord-status ${String(order.orderStatus).toLowerCase()}`}>
          {STATUS_LABEL[order.orderStatus] || order.orderStatus}
        </span>
      </div>

      {co && (
        <div className="ord-custom">
          <div className="ord-row"><span>Hoạ sĩ</span><strong>{co.artistName || '—'}</strong></div>
          <div className="ord-row"><span>Loại / Phong cách</span><strong>{[co.artType, co.style].filter(Boolean).join(' · ')}</strong></div>
          {co.description && <p className="ord-desc">“{co.description}”</p>}
        </div>
      )}

      {isCustom && <ProgressBar value={progress} />}

      {/* ── Hành động theo trạng thái (đơn vẽ) ── */}
      {isCustom && !closed && (
        <div className="ord-actions">
          {phase === 'DEPOSIT_PAID' && progress < 100 && (
            <p className="ord-wait">⏳ Hoạ sĩ đang thực hiện ({progress}%). Khi đạt 100% bạn có thể thanh toán nốt 70%.</p>
          )}
          {phase === 'DEPOSIT_PAID' && progress === 100 && (
            <button className="ord-btn primary" disabled={busy === 'pay'} onClick={payRemaining}>
              {busy === 'pay' ? 'Đang chuyển tới VNPay…' : `Thanh toán 70% còn lại — ${vnd(order.remainingAmount)}`}
            </button>
          )}
          {phase === 'FULLY_PAID' && (
            <div className="ord-btn-row">
              <button className="ord-btn primary" disabled={!hasImage || busy === 'dl'} onClick={downloadImage}>
                {busy === 'dl' ? 'Đang tải…' : hasImage ? '⬇️ Tải hình tác phẩm' : 'Chưa có hình'}
              </button>
              <button className="ord-btn outline" disabled={busy === 'close'} onClick={close}>
                {busy === 'close' ? 'Đang xử lý…' : '✓ Đơn đã hoàn tất'}
              </button>
            </div>
          )}
        </div>
      )}
      {isCustom && closed && (
        <div className="ord-actions">
          {hasImage && (
            <button className="ord-btn primary" disabled={busy === 'dl'} onClick={downloadImage}>
              {busy === 'dl' ? 'Đang tải…' : '⬇️ Tải lại hình tác phẩm'}
            </button>
          )}
          <p className="ord-done">✓ Đơn đã hoàn tất. Cảm ơn bạn!</p>
        </div>
      )}

      {/* ── Sản phẩm có sẵn (giỏ hàng): danh sách + tải file khi đã thanh toán ── */}
      {!isCustom && order.items?.length > 0 && (
        <div className="ord-items">
          {order.items.map((it, i) => (
            <div className="ord-item-row" key={`${it.productId}-${i}`}>
              {it.imageUrl
                ? <img src={it.imageUrl} alt={it.name} className="ord-item-thumb" />
                : <div className="ord-item-thumb ph">🎨</div>}
              <div className="ord-item-info">
                <p className="ord-item-name">{it.name}</p>
                <span className="ord-item-price">{vnd(it.unitPrice)}</span>
              </div>
              {it.fileUrl ? (
                <a className="ord-dl" href={it.fileUrl} target="_blank" rel="noopener noreferrer" download>
                  ⬇️ Tải về
                </a>
              ) : (
                <span className="ord-dl-locked" title="Tải được sau khi thanh toán">🔒</span>
              )}
            </div>
          ))}
        </div>
      )}

      {err && <p className="so-err" style={{ color: '#fca5a5', fontSize: '.8rem' }}>⚠️ {err}</p>}

      <div className="ord-foot">
        <div className="ord-foot-cell">
          <span>Tổng tiền</span>
          <strong>{vnd(order.totalAmount)}</strong>
        </div>
        <div className="ord-foot-cell">
          <span>Thanh toán</span>
          <strong>{PHASE_LABEL[order.paymentPhase] || order.paymentPhase || '—'}</strong>
        </div>
        <div className="ord-foot-cell">
          <span>Ngày đặt</span>
          <strong>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}</strong>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    axios.get(`${API}/orders`, { params: { page: 1, size: 50 } })
      .then(res => setOrders(res.data?.data?.orders || []))
      .catch(() => setError('Không thể tải danh sách đơn hàng.'))
      .finally(() => setLoading(false));
  }, []);

  const handleClosed = (orderId) =>
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, orderStatus: 'COMPLETED' } : o));

  return (
    <div className="orders-page">
      <nav className="prd-nav">
        <span className="nav-logo">🎨 </span>
        <Link to="/" className="prd-nav-logo"> <span>GenZArtist</span></Link>
        <div className="prd-nav-center"></div>
        <div className="prd-nav-right">
          <Link to="/products" className="prd-nav-btn outline">Sản phẩm</Link>
          <Link to="/profile" className="prd-nav-btn outline">{user?.fullName || 'Tài khoản'}</Link>
        </div>
      </nav>

      <div className="ord-wrap">
        <header className="ord-head">
          <h1 className="ord-title">📦 Đơn hàng của tôi</h1>
          <p className="ord-subtitle">Theo dõi trạng thái và tiến độ từng đơn.</p>
        </header>

        {loading ? (
          <div className="ord-state"><div className="prd-spinner" /><p>Đang tải…</p></div>
        ) : error ? (
          <div className="ord-state"><p>{error}</p></div>
        ) : orders.length === 0 ? (
          <div className="ord-state">
            <p>😶 Bạn chưa có đơn hàng nào.</p>
            <Link to="/products" className="ord-cta">Khám phá tác phẩm →</Link>
          </div>
        ) : (
          <div className="ord-list">
            {orders.map(o => <OrderCard key={o.orderId} order={o} onClosed={handleClosed} />)}
          </div>
        )}
      </div>
    </div>
  );
}
