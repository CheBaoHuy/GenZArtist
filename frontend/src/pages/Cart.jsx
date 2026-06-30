import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { vnd } from '../utils/currency';
import './Cart.css';

export default function Cart() {
  const { items, removeItem, updateQty, total, count } = useCart();
  const navigate = useNavigate();
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState('');

  const applyPromo = () => {
    if (promo.toUpperCase() === 'GENZ20') {
      setDiscount(0.2); setPromoMsg('✅ Đã áp dụng giảm 20%!');
    } else if (promo.toUpperCase() === 'ARTIST10') {
      setDiscount(0.1); setPromoMsg('✅ Đã áp dụng giảm 10%!');
    } else {
      setDiscount(0); setPromoMsg('❌ Mã giảm giá không hợp lệ');
    }
  };

  const shipping  = items.some(i => i.type === 'Print') ? 30000 : 0;
  const subtotal  = total;
  const discountAmt = subtotal * discount;
  const finalTotal  = subtotal - discountAmt + shipping;

  return (
    <div className="cart-page">
      <nav className="cart-nav">
        <Link to="/" className="cart-nav-logo">🎨 <span>GenZArtist</span></Link>
        <div className="cart-nav-steps">
          <span className="step-item active">🛒 Giỏ hàng</span>
          <span className="step-sep">›</span>
          <span className="step-item">💳 Thanh toán</span>
          <span className="step-sep">›</span>
          <span className="step-item">✅ Hoàn tất</span>
        </div>
        <Link to="/" className="cart-nav-back">← Tiếp tục mua sắm</Link>
      </nav>

      <div className="cart-layout">
        {/* ── LEFT: Items ── */}
        <div className="cart-main">
          <div className="cart-title-row">
            <h1 className="cart-title">Giỏ hàng</h1>
            <span className="cart-count">{count} sản phẩm</span>
          </div>

          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="empty-icon">🛒</div>
              <h2>Giỏ hàng của bạn đang trống</h2>
              <p>Khám phá những tác phẩm tuyệt vời và thêm vào giỏ hàng</p>
              <Link to="/products" className="empty-browse-btn">Xem tác phẩm →</Link>
            </div>
          ) : (
            <div className="cart-items">
              {items.map(item => (
                <div className="cart-item" key={`${item.id}-${item.type}`}>
                  <div className="cart-item-thumb" style={{ background: item.grad }}></div>
                  <div className="cart-item-info">
                    <div className="cart-item-top">
                      <div>
                        <p className="cart-item-title">{item.title}</p>
                        <p className="cart-item-artist">bởi {item.artist}</p>
                        <span className={`cart-item-type ${item.type === 'Digital' ? 'digital' : 'print'}`}>
                          {item.type === 'Digital' ? '💾 Bản số (Digital)' : '🖼️ Bản in (Print)'}
                        </span>
                      </div>
                      <button
                        className="cart-remove-btn"
                        onClick={() => removeItem(item.id, item.type)}
                        aria-label="Xoá sản phẩm"
                      >✕</button>
                    </div>
                    <div className="cart-item-bottom">
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQty(item.id, item.type, -1)} disabled={item.type === 'Digital'}>−</button>
                        <span className="qty-val">{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.id, item.type, +1)} disabled={item.type === 'Digital'}>+</button>
                      </div>
                      <p className="cart-item-price">{vnd(item.price * item.qty)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Summary ── */}
        {items.length > 0 && (
          <aside className="cart-sidebar">
            <div className="summary-card">
              <h2 className="summary-title">Tóm tắt đơn hàng</h2>

              {/* Promo */}
              <div className="promo-wrap">
                <div className="promo-input-row">
                  <input
                    type="text"
                    className="promo-input"
                    placeholder="Mã giảm giá (thử GENZ20)"
                    value={promo}
                    onChange={e => setPromo(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyPromo()}
                  />
                  <button className="promo-btn" onClick={applyPromo}>Áp dụng</button>
                </div>
                {promoMsg && <p className={`promo-msg ${discount ? 'success' : 'error'}`}>{promoMsg}</p>}
              </div>

              {/* Totals */}
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Tạm tính ({count} sản phẩm)</span>
                  <span>{vnd(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row discount">
                    <span>Giảm giá ({(discount * 100).toFixed(0)}%)</span>
                    <span>−{vnd(discountAmt)}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <span>{shipping === 0 ? 'Miễn phí' : vnd(shipping)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total-row">
                  <span>Tổng cộng</span>
                  <span>{vnd(finalTotal)}</span>
                </div>
              </div>

              <button
                className="checkout-btn"
                onClick={() => navigate('/checkout', { state: { finalTotal, discount, discountAmt, shipping } })}
              >
                Tiến hành thanh toán →
              </button>

              <div className="security-badges">
                <span>🔒 Bảo mật SSL</span>
                <span>💳 Thanh toán VNPay</span>
                <span>↩ Đổi trả dễ dàng</span>
              </div>
            </div>

            {/* Accepted payments */}
            <div className="payment-icons">
              <span className="pay-icon">VNPay</span>
              <span className="pay-icon">ATM</span>
              <span className="pay-icon">QR</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
