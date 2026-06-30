import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { vnd } from '../utils/currency';
import './Checkout.css';

const REDIRECT_SECONDS = 6;

// Trang hiển thị kết quả sau khi VNPay redirect về (qua backend /payment/vnpay/return)
export default function PaymentResult() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const status  = params.get('status');           // success | failed
  const phase   = params.get('phase') || 'deposit'; // deposit | remaining
  const code    = params.get('code') || '';
  const success = status === 'success';

  const [pending, setPending] = useState(null);

  useEffect(() => {
    try { setPending(JSON.parse(localStorage.getItem('genz_pending_payment') || 'null')); }
    catch { setPending(null); }
    // Thanh toán đủ 100% -> dọn dữ liệu tạm
    if (success && phase === 'remaining') {
      localStorage.removeItem('genz_pending_payment');
    }
  }, [success, phase]);

  const deposit   = pending?.deposit ?? 0;
  const remaining = pending?.remaining ?? 0;
  const total     = pending?.finalTotal ?? 0;

  const fullPayment = success && pending?.fullPayment;     // sản phẩm sẵn: trả full
  const fullyPaid   = success && phase === 'remaining';    // đơn custom: vừa trả nốt 70%

  // Thanh toán thành công -> tự đếm ngược rồi chuyển về trang Đơn hàng
  const [secs, setSecs] = useState(REDIRECT_SECONDS);
  useEffect(() => {
    if (!success) return undefined;
    const iv = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 0)), 1000);
    const t = setTimeout(() => navigate('/orders'), REDIRECT_SECONDS * 1000);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, [success, navigate]);

  return (
    <div className="checkout-page">
      <nav className="co-nav">
        <Link to="/" className="co-nav-logo">🎨 <span>GenZArtist</span></Link>
        <div style={{ width: 160 }}></div>
      </nav>

      <div className="success-screen">
        {!success ? (
          <>
            <div className="success-icon">❌</div>
            <h1>Thanh toán thất bại</h1>
            <p>Giao dịch VNPay không thành công{code ? ` (mã ${code})` : ''}. Vui lòng thử lại.</p>
            <div className="success-actions">
              <Link to="/cart" className="success-btn primary">Quay lại giỏ hàng</Link>
              <Link to="/" className="success-btn outline">Về trang chủ</Link>
            </div>
          </>
        ) : fullPayment ? (
          <>
            <div className="success-icon">✅</div>
            <h1>Thanh toán thành công!</h1>
            <p>Cảm ơn bạn! Đơn hàng đã hoàn tất{total ? ` với tổng ${vnd(total)}` : ''}.</p>
            <p className="pr-countdown">Tự động chuyển tới <strong>Đơn hàng</strong> sau {secs}s…</p>
            <div className="success-actions">
              <Link to="/orders" className="success-btn primary">Xem đơn hàng ngay →</Link>
              <Link to="/products" className="success-btn outline">Tiếp tục mua sắm</Link>
            </div>
          </>
        ) : (
          <>
            <div className="success-icon">{fullyPaid ? '✅' : '🎉'}</div>
            <h1>{fullyPaid ? 'Đã thanh toán đủ 100%!' : 'Đặt cọc 30% thành công!'}</h1>
            <p>
              {fullyPaid
                ? 'Cảm ơn bạn! Đơn hàng đã hoàn tất, bạn có thể tải tác phẩm ở trang Đơn hàng.'
                : 'Bạn đã cọc 30% qua VNPay để hoạ sĩ bắt đầu thực hiện. Khi hoạ sĩ hoàn thành 100%, bạn vào trang Đơn hàng để thanh toán 70% còn lại và tải tác phẩm.'}
            </p>

            <div className="pay-split-box">
              <div className="pay-split-row done">
                <span>① Đặt cọc 30%</span>
                <strong>{vnd(deposit)} ✓</strong>
              </div>
              <div className={`pay-split-row ${fullyPaid ? 'done' : 'pending'}`}>
                <span>② Thanh toán 70% còn lại</span>
                <strong>{vnd(remaining)} {fullyPaid ? '✓' : '⏳'}</strong>
              </div>
              <div className="pay-split-divider"></div>
              <div className="pay-split-row total">
                <span>Tổng đơn hàng</span>
                <strong>{vnd(total)}</strong>
              </div>
            </div>

            <p className="pr-countdown">Tự động chuyển tới <strong>Đơn hàng</strong> sau {secs}s…</p>
            <div className="success-actions">
              <Link to="/orders" className="success-btn primary">Xem đơn hàng ngay →</Link>
              <Link to="/" className="success-btn outline">Về trang chủ</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
