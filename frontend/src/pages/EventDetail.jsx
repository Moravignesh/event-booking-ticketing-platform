import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function EventDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [booking, setBooking] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(r => setEvent(r.data))
      .catch(() => { toast.error('Event not found'); navigate('/events') })
      .finally(() => setLoading(false))
  }, [id])

  const handleBook = async () => {
    if (!user) return navigate('/login')
    setBooking(true)
    try {
      const bRes = await api.post('/bookings', { event_id: event.id, quantity })
      const pRes = await api.post('/payments/create-session', { booking_id: bRes.data.id })
      toast.success('🎉 Booking confirmed!')
      // Use React Router navigate for internal URLs, window.location for external Stripe
      const url = pRes.data.checkout_url
      if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
        const path = url.replace(/^https?:\/\/[^/]+/, '')
        setTimeout(() => navigate(path, { replace: true }), 500)
      } else {
        window.location.href = url
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Booking failed. Please try again.')
    } finally {
      setBooking(false)
      setShowModal(false)
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  if (!event) return null

  const date = new Date(event.date)
  const soldPercent = Math.round(((event.total_tickets - event.available_tickets) / event.total_tickets) * 100)

  return (
    <div className="page">
      {/* Back button */}
      <button onClick={() => navigate('/events')} className="btn btn-ghost" style={{ marginBottom: '1.5rem', paddingLeft: 0, gap: '0.4rem' }}>
        ← Back to Events
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>

        {/* ── Left column ─────────────────────────────────────── */}
        <div className="fade-in">
          {/* Hero image */}
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.5rem', paddingTop: '46%', position: 'relative', background: 'var(--bg3)' }}>
            {event.image_url ? (
              <img src={event.image_url} alt={event.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', background: 'linear-gradient(135deg,var(--bg3),var(--bg2))' }}>🎪</div>
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.5) 100%)' }} />
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-purple">{event.category}</span>
            {event.available_tickets === 0 && <span className="badge badge-red">🚫 Sold Out</span>}
            {event.available_tickets > 0 && event.available_tickets <= 20 && (
              <span className="badge badge-gold">⚡ Only {event.available_tickets} tickets left!</span>
            )}
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '1.25rem', lineHeight: 1.2 }}>{event.title}</h1>

          {/* Meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {[
              { icon: '📅', text: date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
              { icon: '🕐', text: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
              { icon: '📍', text: event.location },
              { icon: '💰', text: `₹${event.price.toLocaleString('en-IN')} per ticket` },
            ].map(m => (
              <div key={m.icon} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text2)', fontSize: '0.92rem' }}>
                <span style={{ fontSize: '1.05rem', width: 22, textAlign: 'center' }}>{m.icon}</span>
                <span>{m.text}</span>
              </div>
            ))}
          </div>

          <div className="divider" />
          <h3 style={{ marginBottom: '0.9rem', fontSize: '1.05rem' }}>About this event</h3>
          <p style={{ color: 'var(--text2)', lineHeight: 1.85, whiteSpace: 'pre-line', fontSize: '0.93rem' }}>
            {event.description || 'No description provided.'}
          </p>

          <div className="divider" />
          <h3 style={{ marginBottom: '0.9rem', fontSize: '1.05rem' }}>Ticket Availability</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', color: 'var(--text3)', marginBottom: '0.5rem' }}>
            <span><strong style={{ color: 'var(--text)' }}>{event.available_tickets}</strong> of {event.total_tickets} available</span>
            <span>{soldPercent}% sold</span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill" style={{ width: `${soldPercent}%`, background: soldPercent >= 80 ? 'var(--red)' : soldPercent >= 50 ? 'var(--gold)' : undefined }} />
          </div>
        </div>

        {/* ── Right column — Booking card ──────────────────────── */}
        <div style={{ position: 'sticky', top: 76 }} className="fade-in">
          <div className="card">
            <div className="card-body">
              <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent2)', fontFamily: 'var(--font-head)', lineHeight: 1 }}>
                  ₹{event.price.toLocaleString('en-IN')}
                </div>
                <div style={{ color: 'var(--text3)', fontSize: '0.82rem', marginTop: '0.25rem' }}>per ticket · includes all fees</div>
              </div>

              {event.available_tickets > 0 ? (
                <>
                  {/* Quantity selector */}
                  <div className="form-group">
                    <label className="form-label">Number of Tickets</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="btn btn-outline"
                        style={{ width: 40, height: 40, padding: 0, borderRadius: 8, fontSize: '1.3rem', flexShrink: 0 }}
                      >−</button>
                      <input
                        type="number" min="1" max={Math.min(10, event.available_tickets)}
                        value={quantity}
                        onChange={e => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                        style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem' }}
                      />
                      <button
                        onClick={() => setQuantity(q => Math.min(Math.min(10, event.available_tickets), q + 1))}
                        className="btn btn-outline"
                        style={{ width: 40, height: 40, padding: 0, borderRadius: 8, fontSize: '1.3rem', flexShrink: 0 }}
                      >+</button>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.87rem', color: 'var(--text2)', marginBottom: '0.5rem' }}>
                      <span>₹{event.price.toLocaleString('en-IN')} × {quantity} ticket{quantity > 1 ? 's' : ''}</span>
                      <span>₹{(event.price * quantity).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ height: 1, background: 'var(--border)', margin: '0.6rem 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Total</span>
                      <span style={{ color: 'var(--accent2)', fontSize: '1.05rem' }}>₹{(event.price * quantity).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => user ? setShowModal(true) : navigate('/login')}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', fontSize: '1rem' }}
                    disabled={booking}
                  >
                    {booking ? '⏳ Processing...' : '🎫 Book Tickets'}
                  </button>

                  {!user && (
                    <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text3)', marginTop: '0.65rem' }}>
                      <Link to="/login" style={{ color: 'var(--accent3)' }}>Sign in</Link> required to book
                    </p>
                  )}

                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {['✅ Instant confirmation', '✅ Secure payment', '✅ Free cancellation'].map(t => (
                      <div key={t} style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{t}</div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>😔</div>
                  <p style={{ fontWeight: 700, color: 'var(--red)', fontSize: '1rem' }}>Sold Out</p>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text3)', marginTop: '0.35rem' }}>All tickets have been booked</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirm Modal ──────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => !booking && setShowModal(false)}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Your Booking</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '1rem' }} disabled={booking}>✕</button>
            </div>
            <div className="modal-body">
              {/* Event summary */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem', background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                {event.image_url && (
                  <img src={event.image_url} alt={event.title} style={{ width: 80, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>{event.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span>📅 {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span>📍 {event.location}</span>
                    <span>🎫 {quantity} ticket{quantity > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.87rem', color: 'var(--text2)', marginBottom: '0.5rem' }}>
                  <span>₹{event.price.toLocaleString('en-IN')} × {quantity}</span>
                  <span>₹{(event.price * quantity).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: 1, background: 'var(--border)', margin: '0.6rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--accent2)', fontSize: '1.1rem' }}>₹{(event.price * quantity).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text3)', lineHeight: 1.6 }}>
                💡 <strong>Demo mode:</strong> Payment is auto-confirmed instantly. Your booking will be confirmed and you'll be redirected to the success page.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-outline" disabled={booking}>Cancel</button>
              <button onClick={handleBook} className="btn btn-primary" disabled={booking} style={{ minWidth: 140 }}>
                {booking ? '⏳ Processing...' : '✓ Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
