import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { vnd } from '../utils/currency';
import vnpayLogo from '../assets/vnpay.webp';
import './Checkout.css';

const STEPS = ['Giỏ hàng', 'Thanh toán', 'Hoàn tất'];

export default function Checkout() {
  const { items, clearCart } = useCart();
  const location  = useLocation();
  const { finalTotal = 0, discount = 0, discountAmt = 0, shipping = 0, customOrder = null, orderId = null } =
    location.state || {};

  // Cọc 30%/70% CHỈ áp dụng cho đơn vẽ theo yêu cầu (custom).
  // Sản phẩm có sẵn (giỏ hàng) -> thanh toán full như bình thường.
  const isCustom  = !!customOrder;
  const DEPOSIT_RATE = 0.30;
  const deposit   = Math.round(finalTotal * DEPOSIT_RATE);
  const remaining = Math.round(finalTotal - deposit);
  const [paidRemaining, setPaidRemaining] = useState(false);
  const [payingRemaining, setPayingRemaining] = useState(false);

  const handlePayRemaining = () => {
    setPayingRemaining(true);
    setTimeout(() => { setPayingRemaining(false); setPaidRemaining(true); }, 1800);
  };

  const [step, setStep]       = useState(1); // 1 = info, 2 = payment, 3 = done
  const [isLoading, setIsLoading] = useState(false);

  const [info, setInfo] = useState({ email: '', name: '' });
  const [billing, setBilling] = useState({ address: '', city: '', zip: '', country: 'Vietnam' });

  // Tạo thanh toán VNPay rồi chuyển hướng. Đơn custom: cọc 30% theo orderId.
  // Giỏ hàng: tạo đơn thật từ các sản phẩm rồi thanh toán full -> hiện ở trang Đơn hàng.
  const API = 'http://localhost:8080/api/v1';
  const handlePay = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let payOrderId = orderId;
      let phase, pending;

      if (isCustom) {
        phase = 'deposit';
        pending = { finalTotal, deposit, remaining, orderId };
      } else {
        // Tạo đơn thật từ giỏ hàng (backend tính tổng theo giá sản phẩm)
        const orderRes = await axios.post(`${API}/orders`, {
          paymentMethod: 'VNPAY',
          items: items.map(i => ({ productId: i.id, quantity: i.qty })),
        });
        payOrderId = orderRes?.data?.data?.orderId;
        const backendTotal = orderRes?.data?.data?.totalAmount ?? finalTotal;
        if (!payOrderId) throw new Error('Không tạo được đơn hàng.');
        phase = 'full';
        pending = { fullPayment: true, finalTotal: backendTotal, orderId: payOrderId };
      }

      localStorage.setItem('genz_pending_payment', JSON.stringify(pending));
      const res = await axios.get(`${API}/payment/vnpay/create`, {
        params: { orderId: payOrderId, phase },
      });
      const url = res?.data?.data?.paymentUrl;
      if (url) {
        clearCart();
        window.location.href = url; // sang VNPay sandbox
      } else {
        setIsLoading(false);
        alert('Không tạo được URL thanh toán VNPay.');
      }
    } catch (err) {
      setIsLoading(false);
      alert('Lỗi tạo thanh toán: ' + (err?.response?.data?.message || err?.message || err));
    }
  };

  return (
    <div className="checkout-page">
      {/* ── NAVBAR ── */}
      <nav className="co-nav">
        <Link to="/" className="co-nav-logo">🎨 <span>GenZArtist</span></Link>
        <div className="co-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`co-step ${i < step ? 'done' : ''} ${i === step - 1 ? 'active' : ''}`}>
              <div className="co-step-dot">{i < step - 1 ? '✓' : i + 1}</div>
              <span>{s}</span>
              {i < STEPS.length - 1 && <div className="co-step-line"></div>}
            </div>
          ))}
        </div>
        <div style={{ width: 160 }}></div>
      </nav>

      {/* ── DONE STATE ── */}
      {step === 3 && (
        <div className="success-screen">
          <div className="success-icon">{paidRemaining ? '✅' : '🎉'}</div>
          <h1>{paidRemaining ? 'Đã thanh toán đủ 100%!' : 'Đã đặt cọc thành công!'}</h1>
          <p>
            {paidRemaining
              ? 'Cảm ơn bạn! Đơn hàng đã hoàn tất và tác phẩm là của bạn.'
              : 'Bạn đã cọc 30% để Artist bắt đầu thực hiện. Phần còn lại thanh toán khi nhận và hài lòng với sản phẩm.'}
          </p>

          {/* Tiến trình thanh toán 2 lần */}
          <div className="pay-split-box">
            <div className="pay-split-row done">
              <span>① Đặt cọc 30%</span>
              <strong>{vnd(deposit)} ✓</strong>
            </div>
            <div className={`pay-split-row ${paidRemaining ? 'done' : 'pending'}`}>
              <span>② Thanh toán 70% còn lại</span>
              <strong>{vnd(remaining)} {paidRemaining ? '✓' : '⏳'}</strong>
            </div>
            <div className="pay-split-divider"></div>
            <div className="pay-split-row total">
              <span>Tổng đơn hàng</span>
              <strong>{vnd(finalTotal)}</strong>
            </div>
          </div>

          {!paidRemaining && (
            <button
              className={`success-btn primary ${payingRemaining ? 'loading' : ''}`}
              onClick={handlePayRemaining}
              disabled={payingRemaining}
            >
              {payingRemaining
                ? 'Đang xử lý…'
                : `Đã nhận hàng — Thanh toán nốt ${vnd(remaining)} (70%)`}
            </button>
          )}

          <div className="success-actions">
            <Link to="/" className="success-btn outline">Về trang chủ</Link>
          </div>
          <div className="success-confetti">
            {['🎨','✨','🌟','💜','🎊','🖼️'].map((e,i) => (
              <span key={i} className="confetti-piece" style={{ animationDelay: `${i*0.15}s` }}>{e}</span>
            ))}
          </div>
        </div>
      )}

      {step !== 3 && (
        <div className="checkout-layout">
          {/* ── LEFT: Form ── */}
          <div className="checkout-main">
            {/* Step 1 – Contact info */}
            {step === 1 && (
              <div className="co-section">
                <h2 className="co-section-title">📋 Thông tin liên hệ</h2>
                <div className="co-form">
                  <div className="co-field">
                    <label>Họ và tên</label>
                    <input type="text" placeholder="Nguyễn Văn A"
                      value={info.name} onChange={e=>setInfo({...info,name:e.target.value})} />
                  </div>
                  <div className="co-field">
                    <label>Địa chỉ email</label>
                    <input type="email" placeholder="ban@example.com"
                      value={info.email} onChange={e=>setInfo({...info,email:e.target.value})} />
                  </div>
                </div>

                <h2 className="co-section-title" style={{marginTop:'2rem'}}>🌍 Địa chỉ nhận hàng</h2>
                <div className="co-form">
                  <div className="co-field full">
                    <label>Địa chỉ</label>
                    <input type="text" placeholder="123 Đường Láng, Đống Đa"
                      value={billing.address} onChange={e=>setBilling({...billing,address:e.target.value})} />
                  </div>
                  <div className="co-field">
                    <label>Tỉnh / Thành phố</label>
                    <input type="text" placeholder="Hà Nội"
                      value={billing.city} onChange={e=>setBilling({...billing,city:e.target.value})} />
                  </div>
                  <div className="co-field">
                    <label>Mã bưu chính</label>
                    <input type="text" placeholder="100000"
                      value={billing.zip} onChange={e=>setBilling({...billing,zip:e.target.value})} />
                  </div>
                  <div className="co-field">
                    <label>Quốc gia</label>
                    <select value={billing.country} onChange={e=>setBilling({...billing,country:e.target.value})}>
                      <option value="Vietnam">Việt Nam</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                </div>

                <button className="co-next-btn" onClick={()=>setStep(2)}
                  disabled={!info.name || !info.email}>
                  Tiếp tục thanh toán →
                </button>
              </div>
            )}

            {/* Step 2 – Payment */}
            {step === 2 && (
              <form className="co-section" onSubmit={handlePay}>
                <h2 className="co-section-title">💳 {isCustom ? 'Đặt cọc 30%' : 'Thanh toán'}</h2>
                {isCustom ? (
                  <p className="co-deposit-note">
                    Để hoạ sĩ bắt đầu thực hiện, bạn cần cọc trước <strong>30%</strong> giá trị đơn hàng
                    (<strong>{vnd(deposit)}</strong>). 70% còn lại (<strong>{vnd(remaining)}</strong>)
                    thanh toán sau khi nhận và hài lòng với sản phẩm.
                  </p>
                ) : (
                  <p className="co-deposit-note">
                    Thanh toán toàn bộ đơn hàng <strong>{vnd(finalTotal)}</strong> qua VNPay.
                  </p>
                )}

                {/* Phương thức thanh toán: chỉ VNPay */}
                <div className="vnpay-pay-box">
                  <img src={vnpayLogo} alt="VNPay" className="vnpay-logo-img" />
                  <div className="vnpay-info">
                    <p className="vnpay-title">Thanh toán qua VNPay</p>
                    <p className="vnpay-desc">
                      Bạn sẽ được chuyển sang cổng VNPay để hoàn tất đặt cọc.
                      Hỗ trợ thẻ ATM nội địa, thẻ quốc tế và QR ngân hàng.
                    </p>
                  </div>
                </div>

                <div className="co-btn-row">
                  <button type="button" className="co-back-btn" onClick={()=>setStep(1)}>← Quay lại</button>
                  <button type="submit" className={`co-pay-btn ${isLoading?'loading':''}`} disabled={isLoading}>
                    {isLoading
                      ? <><span className="co-spinner"></span> Đang xử lý…</>
                      : isCustom ? `Cọc 30% — ${vnd(deposit)} →` : `Thanh toán — ${vnd(finalTotal)} →`}
                  </button>
                </div>

                <p className="co-secure-note">🔒 Giao dịch được mã hoá và xử lý an toàn qua cổng thanh toán VNPay.</p>
              </form>
            )}
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <aside className="checkout-sidebar">
            <div className="co-summary-card">
              <h3 className="co-summary-title">🛒 Tóm tắt đơn hàng</h3>
              {customOrder && (
                <div className="co-custom-order">
                  <p className="co-custom-badge">✏️ Đơn vẽ theo yêu cầu</p>
                  <div className="co-custom-row"><span>Người đặt</span><strong>{customOrder.customerName}</strong></div>
                  <div className="co-custom-row"><span>Loại tranh</span><strong>{customOrder.artType}</strong></div>
                  <div className="co-custom-row"><span>Phong cách</span><strong>{customOrder.style}</strong></div>
                  <div className="co-custom-row"><span>Hoạ sĩ</span><strong>{customOrder.artistName}</strong></div>
                  {customOrder.refImageName && (
                    <div className="co-custom-row"><span>Ảnh minh hoạ</span><strong>{customOrder.refImageName}</strong></div>
                  )}
                  <div className="co-custom-row"><span>Ngân sách</span><strong>{vnd(customOrder.budgetVnd ?? finalTotal)}</strong></div>
                  <p className="co-custom-desc">“{customOrder.description}”</p>
                </div>
              )}
              {/* Đơn vẽ theo yêu cầu không gắn sản phẩm trong giỏ -> chỉ hiện item giỏ khi mua thường */}
              {!customOrder && (
                <div className="co-summary-items">
                  {items.map(item => (
                    <div className="co-summary-item" key={`${item.id}-${item.type}`}>
                      <div className="co-sum-thumb" style={{ background: item.grad }}></div>
                      <div className="co-sum-info">
                        <p className="co-sum-name">{item.title}</p>
                        <p className="co-sum-sub">{item.type === 'Digital' ? '💾 Bản số' : '🖼️ Bản in'} × {item.qty}</p>
                      </div>
                      <span className="co-sum-price">{vnd(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="co-sum-rows">
                <div className="co-sum-row"><span>Tạm tính</span><span>{vnd(finalTotal + discountAmt - shipping)}</span></div>
                {discountAmt > 0 && <div className="co-sum-row disc"><span>Giảm giá</span><span>−{vnd(discountAmt)}</span></div>}
                <div className="co-sum-row"><span>Phí vận chuyển</span><span>{shipping===0?'Miễn phí':vnd(shipping)}</span></div>
                <div className="co-sum-divider"></div>
                <div className="co-sum-row co-sum-total"><span>Tổng cộng</span><span>{vnd(finalTotal)}</span></div>
                {isCustom && (
                  <>
                    <div className="co-sum-divider"></div>
                    <div className="co-sum-row"><span>Cọc 30% (trả ngay)</span><span>{vnd(deposit)}</span></div>
                    <div className="co-sum-row"><span>Còn lại 70% (khi nhận hàng)</span><span>{vnd(remaining)}</span></div>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
