import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const STEPS = ['Cart', 'Payment', 'Done'];

export default function Checkout() {
  const { items, clearCart } = useCart();
  const location  = useLocation();
  const navigate  = useNavigate();
  const { finalTotal = 0, discount = 0, discountAmt = 0, shipping = 0 } =
    location.state || {};

  const [step, setStep]       = useState(1); // 1 = info, 2 = payment, 3 = done
  const [payMethod, setPayMethod] = useState('card');
  const [isLoading, setIsLoading] = useState(false);
  const [cardFocus, setCardFocus] = useState('');

  const [info, setInfo] = useState({ email: '', name: '' });
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', holder: '' });
  const [billing, setBilling] = useState({ address: '', city: '', zip: '', country: 'Vietnam' });

  const formatCard = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g,'').slice(0,4);
    return d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) : d;
  };

  const handlePay = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setStep(3); clearCart(); }, 2200);
  };

  const cardMasked = card.number.replace(/\s/g,'').padEnd(16,'•')
    .replace(/(.{4})/g,'$1 ').trim();
  const isFlipped = cardFocus === 'cvv';

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
          <div className="success-icon">🎉</div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your artwork is on its way!</p>
          <p className="order-id">Order #GZ-{Math.random().toString(36).slice(2,8).toUpperCase()}</p>
          <div className="success-actions">
            <Link to="/" className="success-btn primary">Back to Home</Link>
            <Link to={`/profile/luna.exe`} className="success-btn outline">View Downloads</Link>
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
                <h2 className="co-section-title">📋 Contact Information</h2>
                <div className="co-form">
                  <div className="co-field">
                    <label>Full Name</label>
                    <input type="text" placeholder="Nguyễn Văn A"
                      value={info.name} onChange={e=>setInfo({...info,name:e.target.value})} />
                  </div>
                  <div className="co-field">
                    <label>Email Address</label>
                    <input type="email" placeholder="you@example.com"
                      value={info.email} onChange={e=>setInfo({...info,email:e.target.value})} />
                  </div>
                </div>

                <h2 className="co-section-title" style={{marginTop:'2rem'}}>🌍 Billing Address</h2>
                <div className="co-form">
                  <div className="co-field full">
                    <label>Street Address</label>
                    <input type="text" placeholder="123 Đường Láng, Đống Đa"
                      value={billing.address} onChange={e=>setBilling({...billing,address:e.target.value})} />
                  </div>
                  <div className="co-field">
                    <label>City</label>
                    <input type="text" placeholder="Hà Nội"
                      value={billing.city} onChange={e=>setBilling({...billing,city:e.target.value})} />
                  </div>
                  <div className="co-field">
                    <label>ZIP / Postal Code</label>
                    <input type="text" placeholder="100000"
                      value={billing.zip} onChange={e=>setBilling({...billing,zip:e.target.value})} />
                  </div>
                  <div className="co-field">
                    <label>Country</label>
                    <select value={billing.country} onChange={e=>setBilling({...billing,country:e.target.value})}>
                      <option>Vietnam</option><option>United States</option>
                      <option>Japan</option><option>South Korea</option><option>Other</option>
                    </select>
                  </div>
                </div>

                <button className="co-next-btn" onClick={()=>setStep(2)}
                  disabled={!info.name || !info.email}>
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* Step 2 – Payment */}
            {step === 2 && (
              <form className="co-section" onSubmit={handlePay}>
                <h2 className="co-section-title">💳 Payment Method</h2>

                {/* Method tabs */}
                <div className="pay-method-tabs">
                  {[
                    { id:'card',   label:'💳 Credit Card' },
                    { id:'momo',   label:'🟣 MoMo'        },
                    { id:'zalopay',label:'🔵 ZaloPay'     },
                    { id:'paypal', label:'🔷 PayPal'      },
                  ].map(m => (
                    <button key={m.id} type="button"
                      className={`pay-tab ${payMethod===m.id?'active':''}`}
                      onClick={()=>setPayMethod(m.id)}>
                      {m.label}
                    </button>
                  ))}
                </div>

                {payMethod === 'card' && (
                  <>
                    {/* Card preview */}
                    <div className={`card-preview ${isFlipped ? 'flipped' : ''}`}>
                      <div className="card-front">
                        <div className="card-chip">💳</div>
                        <div className="card-number">{cardMasked}</div>
                        <div className="card-bottom">
                          <div>
                            <div className="card-label">Card Holder</div>
                            <div className="card-holder">{card.holder || 'FULL NAME'}</div>
                          </div>
                          <div>
                            <div className="card-label">Expires</div>
                            <div className="card-expiry">{card.expiry || 'MM/YY'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="card-back">
                        <div className="card-stripe"></div>
                        <div className="card-cvv-wrap">
                          <span className="card-label">CVV</span>
                          <div className="card-cvv-box">{card.cvv ? '•'.repeat(card.cvv.length) : '•••'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Card fields */}
                    <div className="co-form">
                      <div className="co-field full">
                        <label>Card Number</label>
                        <input type="text" placeholder="0000 0000 0000 0000"
                          value={card.number} maxLength={19}
                          onChange={e=>setCard({...card,number:formatCard(e.target.value)})}
                          onFocus={()=>setCardFocus('number')} onBlur={()=>setCardFocus('')} />
                      </div>
                      <div className="co-field full">
                        <label>Card Holder Name</label>
                        <input type="text" placeholder="NGUYEN VAN A"
                          value={card.holder}
                          onChange={e=>setCard({...card,holder:e.target.value.toUpperCase()})}
                          onFocus={()=>setCardFocus('holder')} onBlur={()=>setCardFocus('')} />
                      </div>
                      <div className="co-field">
                        <label>Expiry Date</label>
                        <input type="text" placeholder="MM/YY" maxLength={5}
                          value={card.expiry}
                          onChange={e=>setCard({...card,expiry:formatExpiry(e.target.value)})}
                          onFocus={()=>setCardFocus('expiry')} onBlur={()=>setCardFocus('')} />
                      </div>
                      <div className="co-field">
                        <label>CVV</label>
                        <input type="password" placeholder="•••" maxLength={4}
                          value={card.cvv}
                          onChange={e=>setCard({...card,cvv:e.target.value.replace(/\D/g,'').slice(0,4)})}
                          onFocus={()=>setCardFocus('cvv')} onBlur={()=>setCardFocus('')} />
                      </div>
                    </div>
                  </>
                )}

                {payMethod !== 'card' && (
                  <div className="qr-pay-box">
                    <div className="qr-placeholder">
                      <div className="qr-grid">
                        {Array.from({length:25}).map((_,i)=>(
                          <div key={i} className="qr-cell" style={{
                            background: Math.random()>.5 ? 'rgba(168,85,247,.8)' : 'transparent'
                          }}></div>
                        ))}
                      </div>
                    </div>
                    <p className="qr-instruction">Open <strong>{payMethod === 'momo' ? 'MoMo' : payMethod === 'zalopay' ? 'ZaloPay' : 'PayPal'}</strong> app and scan this QR code to pay <strong>${finalTotal.toFixed(2)}</strong></p>
                  </div>
                )}

                <div className="co-btn-row">
                  <button type="button" className="co-back-btn" onClick={()=>setStep(1)}>← Back</button>
                  <button type="submit" className={`co-pay-btn ${isLoading?'loading':''}`} disabled={isLoading}>
                    {isLoading
                      ? <><span className="co-spinner"></span> Processing…</>
                      : `Pay $${finalTotal.toFixed(2)} →`}
                  </button>
                </div>

                <p className="co-secure-note">🔒 Your payment is encrypted with 256-bit SSL. We never store your card details.</p>
              </form>
            )}
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <aside className="checkout-sidebar">
            <div className="co-summary-card">
              <h3 className="co-summary-title">🛒 Order Summary</h3>
              <div className="co-summary-items">
                {items.map(item => (
                  <div className="co-summary-item" key={`${item.id}-${item.type}`}>
                    <div className="co-sum-thumb" style={{ background: item.grad }}></div>
                    <div className="co-sum-info">
                      <p className="co-sum-name">{item.title}</p>
                      <p className="co-sum-sub">{item.type === 'Digital' ? '💾 Digital' : '🖼️ Print'} × {item.qty}</p>
                    </div>
                    <span className="co-sum-price">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="co-sum-rows">
                <div className="co-sum-row"><span>Subtotal</span><span>${(finalTotal + discountAmt - shipping).toFixed(2)}</span></div>
                {discountAmt > 0 && <div className="co-sum-row disc"><span>Discount</span><span>−${discountAmt.toFixed(2)}</span></div>}
                <div className="co-sum-row"><span>Shipping</span><span>{shipping===0?'Free':`$${shipping.toFixed(2)}`}</span></div>
                <div className="co-sum-divider"></div>
                <div className="co-sum-row co-sum-total"><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
