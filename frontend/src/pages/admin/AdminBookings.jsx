import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const statusColors = { confirmed: 'badge-green', pending: 'badge-gold', cancelled: 'badge-red' }
const statusIcons  = { confirmed: '✅', pending: '⏳', cancelled: '❌' }

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('cards') // 'cards' | 'table'
  const [cancelling, setCancelling] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/bookings').then(r => setBookings(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking? The tickets will be released back.')) return
    setCancelling(id)
    try {
      await api.post(`/bookings/${id}/cancel`)
      toast.success('Booking cancelled')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error cancelling')
    } finally { setCancelling(null) }
  }

  const filtered = bookings.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        b.booking_ref?.toLowerCase().includes(q) ||
        b.event?.title?.toLowerCase().includes(q) ||
        b.user?.name?.toLowerCase().includes(q) ||
        b.user?.email?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const counts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">All Bookings</h1>
          <p className="page-subtitle">{bookings.length} total · {counts.confirmed} confirmed · {counts.pending} pending</p>
        </div>
        {/* View toggle */}
        <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 8, padding: 3, border: '1px solid var(--border)' }}>
          {[['cards', '⊞ Cards'], ['table', '☰ Table']].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '0.35rem 0.85rem', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: view === v ? 'var(--accent)' : 'transparent',
              color: view === v ? 'white' : 'var(--text2)',
              fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.15s'
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { key: 'all',       label: 'Total',     icon: '🎫', color: 'var(--accent2)' },
          { key: 'confirmed', label: 'Confirmed',  icon: '✅', color: 'var(--green)'   },
          { key: 'pending',   label: 'Pending',    icon: '⏳', color: 'var(--gold)'    },
          { key: 'cancelled', label: 'Cancelled',  icon: '❌', color: 'var(--red)'     },
        ].map(s => (
          <div key={s.key} className="stat-card" onClick={() => setFilter(s.key)} style={{ cursor: 'pointer', borderColor: filter === s.key ? 'var(--accent)' : 'var(--border)', transition: 'all 0.15s' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-head)' }}>{counts[s.key]}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text2)', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>🔍</span>
          <input placeholder="Search by ref, event, name, email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '0.45rem 0.9rem', borderRadius: 100, border: 'none', cursor: 'pointer',
              background: filter === f ? 'var(--accent)' : 'var(--bg3)',
              color: filter === f ? 'white' : 'var(--text2)',
              fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.15s', textTransform: 'capitalize'
            }}>{f} ({counts[f] ?? filtered.length})</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎫</div>
          <h3>No bookings found</h3>
          <p>Try adjusting your search or filter</p>
        </div>
      ) : view === 'cards' ? (
        /* ── CARD VIEW with images ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(b => (
            <div key={b.id} className="card fade-in" style={{ borderLeft: `3px solid ${b.status === 'confirmed' ? 'var(--green)' : b.status === 'pending' ? 'var(--gold)' : 'var(--red)'}` }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem 1.25rem', flexWrap: 'wrap' }}>

                {/* Event image */}
                <div style={{ width: 100, height: 72, borderRadius: 10, overflow: 'hidden', background: 'var(--bg3)', flexShrink: 0, position: 'relative' }}>
                  {b.event?.image_url ? (
                    <img src={b.event.image_url} alt={b.event?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', background: 'linear-gradient(135deg,var(--bg3),var(--bg2))' }}>🎪</div>
                  )}
                </div>

                {/* Event + booking info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <Link to={`/events/${b.event_id}`} style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent2)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
                    >
                      {b.event?.title || 'Unknown Event'}
                    </Link>
                    <span className={`badge ${statusColors[b.status]}`} style={{ fontSize: '0.72rem' }}>
                      {statusIcons[b.status]} {b.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text3)', flexWrap: 'wrap' }}>
                    <span>🎫 <code style={{ color: 'var(--accent3)', background: 'rgba(124,58,237,0.1)', padding: '0.1rem 0.35rem', borderRadius: 4, fontSize: '0.75rem' }}>{b.booking_ref}</code></span>
                    <span>📅 {b.event?.date ? new Date(b.event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                    <span>📍 {b.event?.location || '—'}</span>
                    <span>🎟 {b.quantity} ticket{b.quantity > 1 ? 's' : ''}</span>
                  </div>

                  {/* Customer info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                      {b.user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{b.user?.name || '—'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>· {b.user?.email}</span>
                  </div>
                </div>

                {/* Right: amount + actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent2)', fontFamily: 'var(--font-head)' }}>
                      ₹{b.total_amount?.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>
                      {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </div>
                  </div>
                  {b.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="btn btn-danger btn-sm"
                      disabled={cancelling === b.id}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {cancelling === b.id ? '⏳' : '✕ Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Event</th><th>Ref</th><th>Customer</th><th>Qty</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 44, height: 34, borderRadius: 6, overflow: 'hidden', background: 'var(--bg3)', flexShrink: 0 }}>
                          {b.event?.image_url
                            ? <img src={b.event.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🎪</div>
                          }
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.event?.title || '—'}
                        </span>
                      </div>
                    </td>
                    <td><code style={{ color: 'var(--accent3)', fontSize: '0.75rem', background: 'rgba(124,58,237,0.1)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>{b.booking_ref}</code></td>
                    <td>
                      <div style={{ fontSize: '0.83rem' }}>{b.user?.name || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{b.user?.email}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{b.quantity}</td>
                    <td style={{ color: 'var(--accent2)', fontWeight: 700 }}>₹{b.total_amount?.toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${statusColors[b.status]}`}>{b.status}</span></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td>
                      {b.status !== 'cancelled' && (
                        <button onClick={() => handleCancel(b.id)} className="btn btn-danger btn-sm" style={{ fontSize: '0.73rem' }} disabled={cancelling === b.id}>
                          {cancelling === b.id ? '⏳' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
