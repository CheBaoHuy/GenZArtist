import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { items, removeItem, updateQty, total, count } = useCart();
  const navigate = useNavigate();
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState('');

  const applyPromo = () => {
    if (promo.toUpperCase() === 'GENZ20') {
      setDiscount(0.2); setPromoMsg('✅ 20% discount applied!');
    } else if (promo.toUpperCase() === 'ARTIST10') {
      setDiscount(0.1); setPromoMsg('✅ 10% discount applied!');
    } else {
      setDiscount(0); setPromoMsg('❌ Invalid promo code');
    }
  };

  const shipping  = items.some(i => i.type === 'Print') ? 5.99 : 0;
  const subtotal  = total;
  const discountAmt = subtotal * discount;
  const finalTotal  = subtotal - discountAmt + shipping;

  return (
    <div className="cart-page">
      <nav className="cart-nav">
        <Link to="/" className="cart-nav-logo">🎨 <span>GenZArtist</span></Link>
        <div className="cart-nav-steps">
          <span className="step-item active">🛒 Cart</span>
          <span className="step-sep">›</span>
          <span className="step-item">💳 Payment</span>
          <span className="step-sep">›</span>
          <span className="step-item">✅ Done</span>
        </div>
        <Link to="/" className="cart-nav-back">← Continue Shopping</Link>
      </nav>

      <div className="cart-layout">
        {/* ── LEFT: Items ── */}
        <div className="cart-main">
          <div className="cart-title-row">
            <h1 className="cart-title">Shopping Cart</h1>
            <span className="cart-count">{count} {count === 1 ? 'item' : 'items'}</span>
          </div>

          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="empty-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Discover amazing artworks and add them to your cart</p>
              <Link to="/" className="empty-browse-btn">Browse Artworks →</Link>
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
                        <p className="cart-item-artist">by {item.artist}</p>
                        <span className={`cart-item-type ${item.type === 'Digital' ? 'digital' : 'print'}`}>
                          {item.type === 'Digital' ? '💾 Digital Download' : '🖼️ Print Edition'}
                        </span>
                      </div>
                      <button
                        className="cart-remove-btn"
                        onClick={() => removeItem(item.id, item.type)}
                        aria-label="Remove item"
                      >✕</button>
                    </div>
                    <div className="cart-item-bottom">
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQty(item.id, item.type, -1)} disabled={item.type === 'Digital'}>−</button>
                        <span className="qty-val">{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.id, item.type, +1)} disabled={item.type === 'Digital'}>+</button>
                      </div>
                      <p className="cart-item-price">${(item.price * item.qty).toFixed(2)}</p>
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
              <h2 className="summary-title">Order Summary</h2>

              {/* Promo */}
              <div className="promo-wrap">
                <div className="promo-input-row">
                  <input
                    type="text"
                    className="promo-input"
                    placeholder="Promo code (try GENZ20)"
                    value={promo}
                    onChange={e => setPromo(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyPromo()}
                  />
                  <button className="promo-btn" onClick={applyPromo}>Apply</button>
                </div>
                {promoMsg && <p className={`promo-msg ${discount ? 'success' : 'error'}`}>{promoMsg}</p>}
              </div>

              {/* Totals */}
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal ({count} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                    <span>−${discountAmt.toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                className="checkout-btn"
                onClick={() => navigate('/checkout', { state: { finalTotal, discount, discountAmt, shipping } })}
              >
                Proceed to Checkout →
              </button>

              <div className="security-badges">
                <span>🔒 SSL Secured</span>
                <span>💳 Stripe Protected</span>
                <span>↩ Easy Returns</span>
              </div>
            </div>

            {/* Accepted payments */}
            <div className="payment-icons">
              <span className="pay-icon">VISA</span>
              <span className="pay-icon">MC</span>
              <span className="pay-icon">PayPal</span>
              <span className="pay-icon">MoMo</span>
              <span className="pay-icon">ZaloPay</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
