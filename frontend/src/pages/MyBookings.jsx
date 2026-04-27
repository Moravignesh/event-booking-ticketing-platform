import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

const statusStyles = {
  confirmed: { cls: 'badge-green', icon: '✅', border: 'var(--green)' },
  pending:   { cls: 'badge-gold',  icon: '⏳', border: 'var(--gold)'  },
  cancelled: { cls: 'badge-red',   icon: '❌', border: 'var(--red)'   },
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    api.get('/bookings/my').then(r => setBookings(r.data)).catch(() => toast.error('Failed to load bookings')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?\nYour tickets will be released and you may need to re-book.')) return
    setCancelling(id)
    try {
      await api.post(`/bookings/${id}/cancel`)
      toast.success('Booking cancelled')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel')
    } finally { setCancelling(null) }
  }

  const handlePay = async (bookingId) => {
    try {
      const r = await api.post('/payments/create-session', { booking_id: bookingId })
      const url = r.data.checkout_url
      if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
        const path = url.replace(/^https?:\/\/[^/]+/, '')
        navigate(path)
      } else {
        window.location.href = url
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Payment error')
    }
  }

  const counts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">Track and manage your event reservations</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { key: 'all',       label: 'Total Bookings', icon: '🎫', color: 'var(--accent2)' },
          { key: 'confirmed', label: 'Confirmed',       icon: '✅', color: 'var(--green)'   },
          { key: 'pending',   label: 'Pending Payment', icon: '⏳', color: 'var(--gold)'    },
          { key: 'cancelled', label: 'Cancelled',       icon: '❌', color: 'var(--red)'     },
        ].map(s => (
          <div key={s.key} className="stat-card" onClick={() => setFilter(s.key)} style={{ cursor: 'pointer', borderColor: filter === s.key ? 'var(--accent)' : 'var(--border)', transition: 'all 0.15s' }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{counts[s.key]}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      {bookings.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '0.42rem 1rem', borderRadius: 100, border: 'none', cursor: 'pointer',
              background: filter === f ? 'var(--accent)' : 'var(--bg3)',
              color: filter === f ? 'white' : 'var(--text2)',
              fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.15s', textTransform: 'capitalize'
            }}>{f} ({counts[f]})</button>
          ))}
        </div>
      )}

      {filtered.length === 0 && bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎪</div>
          <h3>No bookings yet</h3>
          <p style={{ marginBottom: '1.5rem' }}>Browse events and book your first experience!</p>
          <Link to="/events" className="btn btn-primary">→ Browse Events</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No {filter} bookings</h3>
          <button onClick={() => setFilter('all')} className="btn btn-outline" style={{ marginTop: '1rem' }}>Show all</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(b => {
            const ss = statusStyles[b.status] || statusStyles.pending
            return (
              <div key={b.id} className="card fade-in" style={{ borderLeft: `3px solid ${ss.border}`, overflow: 'visible' }}>
                <div style={{ display: 'flex', gap: '0', flexDirection: 'column' }}>

                  {/* Top: image + info */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch', padding: '1rem 1.25rem', paddingBottom: '0.75rem' }}>
                    {/* Event image - clickable */}
                    <Link to={`/events/${b.event_id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                      <div style={{ width: 110, height: 78, borderRadius: 10, overflow: 'hidden', background: 'var(--bg3)', position: 'relative', transition: 'opacity 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        {b.event?.image_url ? (
                          <img src={b.event.image_url} alt={b.event?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: 'linear-gradient(135deg,var(--bg3),var(--bg2))' }}>🎪</div>
                        )}
                        {/* Hover overlay */}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.15s', fontSize: '0.7rem', color: 'white', fontWeight: 600 }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                        >View →</div>
                      </div>
                    </Link>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <Link to={`/events/${b.event_id}`} style={{ fontWeight: 700, fontSize: '0.97rem', color: 'var(--text)', textDecoration: 'none' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent2)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
                        >
                          {b.event?.title || 'Event'}
                        </Link>
                        <span className={`badge ${ss.cls}`} style={{ fontSize: '0.72rem' }}>{ss.icon} {b.status}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.79rem', color: 'var(--text3)', flexWrap: 'wrap' }}>
                        <span>🎫 <strong style={{ color: 'var(--accent3)', fontFamily: 'monospace', fontSize: '0.77rem' }}>{b.booking_ref}</strong></span>
                        <span>🎟 {b.quantity} ticket{b.quantity > 1 ? 's' : ''}</span>
                        {b.event?.date && <span>📅 {new Date(b.event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                        {b.event?.location && <span>📍 {b.event.location}</span>}
                      </div>
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent2)', fontFamily: 'var(--font-head)', lineHeight: 1 }}>
                        ₹{b.total_amount.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '0.2rem' }}>
                        {new Date(b.created_at).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: actions bar */}
                  {b.status !== 'cancelled' && (
                    <div style={{ display: 'flex', gap: '0.6rem', padding: '0.6rem 1.25rem', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Link to={`/events/${b.event_id}`} className="btn btn-ghost btn-sm" style={{ fontSize: '0.78rem' }}>
                        🔍 View Event
                      </Link>
                      {b.status === 'pending' && (
                        <button onClick={() => handlePay(b.id)} className="btn btn-success btn-sm" style={{ fontSize: '0.78rem' }}>
                          💳 Complete Payment
                        </button>
                      )}
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="btn btn-danger btn-sm"
                        disabled={cancelling === b.id}
                        style={{ fontSize: '0.78rem', marginLeft: 'auto' }}
                      >
                        {cancelling === b.id ? '⏳ Cancelling...' : '✕ Cancel Booking'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
