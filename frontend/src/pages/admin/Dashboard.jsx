import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const statusColors = { confirmed: 'badge-green', pending: 'badge-gold', cancelled: 'badge-red' }

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics/revenue'),
      api.get('/bookings')
    ]).then(([a, b]) => {
      setAnalytics(a.data)
      setRecentBookings(b.data.slice(0, 8))
    }).catch(e => setError(e.message))
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  if (error) return (
    <div className="page">
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3>Failed to load dashboard</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: '1rem' }}>Retry</button>
      </div>
    </div>
  )

  const a = analytics

  // Revenue chart max value
  const maxRev = a ? Math.max(...a.monthly_revenue.map(m => m.revenue), 1) : 1

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and real-time metrics</p>
      </div>

      {/* KPI Cards */}
      {a && (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {[
            {
              label: 'Confirmed Revenue',
              value: `₹${a.confirmed_revenue.toLocaleString('en-IN')}`,
              sub: `+ ₹${a.pending_revenue.toLocaleString('en-IN')} pending`,
              icon: '💰', color: 'var(--green)'
            },
            {
              label: 'Total Bookings',
              value: a.total_bookings,
              sub: `${a.confirmed_bookings} confirmed · ${a.cancelled_bookings} cancelled`,
              icon: '🎫', color: 'var(--accent2)'
            },
            {
              label: 'Active Events',
              value: a.active_events,
              sub: `${a.total_events} total events`,
              icon: '🎪', color: 'var(--blue)'
            },
            {
              label: 'Pending Bookings',
              value: a.total_bookings - a.confirmed_bookings - a.cancelled_bookings,
              sub: `${a.total_bookings > 0 ? Math.round(a.cancelled_bookings / a.total_bookings * 100) : 0}% cancellation rate`,
              icon: '⏳', color: 'var(--gold)'
            },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-head)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.2rem' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Monthly Revenue Bar Chart */}
      {a?.monthly_revenue && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>Monthly Revenue</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Last 6 months · confirmed bookings only</span>
            </div>

            {a.monthly_revenue.every(m => m.revenue === 0) ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)', fontSize: '0.9rem' }}>
                📊 No confirmed revenue yet — complete some bookings to see data here
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 180, padding: '0 0.25rem' }}>
                {a.monthly_revenue.map((m, i) => {
                  const pct = maxRev > 0 ? (m.revenue / maxRev) : 0
                  const barH = Math.max(pct * 150, m.revenue > 0 ? 8 : 3)
                  const isCurrentMonth = i === a.monthly_revenue.length - 1
                  return (
                    <div key={`${m.month}-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textAlign: 'center', lineHeight: 1.3 }}>
                        {m.revenue > 0 ? (
                          <>
                            <div style={{ color: 'var(--accent2)', fontWeight: 600 }}>
                              ₹{m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(1)}k` : m.revenue}
                            </div>
                            <div>{m.bookings} bkg</div>
                          </>
                        ) : <div>—</div>}
                      </div>
                      <div style={{
                        width: '100%',
                        height: barH,
                        background: isCurrentMonth
                          ? 'linear-gradient(180deg, var(--accent3) 0%, var(--accent) 100%)'
                          : 'linear-gradient(180deg, rgba(124,58,237,0.6) 0%, rgba(124,58,237,0.3) 100%)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.4s ease',
                        boxShadow: isCurrentMonth ? '0 0 12px rgba(124,58,237,0.4)' : 'none'
                      }} />
                      <div style={{ fontSize: '0.72rem', color: isCurrentMonth ? 'var(--accent3)' : 'var(--text3)', fontWeight: isCurrentMonth ? 600 : 400, textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {m.month}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking status summary */}
      {a && (
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          {/* Booking breakdown */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Booking Status</h3>
              {[
                { label: 'Confirmed', count: a.confirmed_bookings, color: 'var(--green)', icon: '✅' },
                { label: 'Pending Payment', count: a.total_bookings - a.confirmed_bookings - a.cancelled_bookings, color: 'var(--gold)', icon: '⏳' },
                { label: 'Cancelled', count: a.cancelled_bookings, color: 'var(--red)', icon: '❌' },
              ].map(s => {
                const pct = a.total_bookings > 0 ? Math.round(s.count / a.total_bookings * 100) : 0
                return (
                  <div key={s.label} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text2)' }}>{s.icon} {s.label}</span>
                      <span style={{ color: s.color, fontWeight: 700 }}>{s.count} ({pct}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { to: '/admin/events', icon: '➕', label: 'Create New Event', desc: 'Add a new event to the platform' },
                  { to: '/admin/events', icon: '🎪', label: 'Manage Events', desc: 'Edit or delete existing events' },
                  { to: '/admin/bookings', icon: '🎫', label: 'View All Bookings', desc: 'Monitor and manage bookings' },
                  { to: '/admin/analytics', icon: '📊', label: 'Full Analytics', desc: 'Revenue & performance reports' },
                ].map(item => (
                  <Link key={item.to + item.label} to={item.to} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.75rem', borderRadius: 'var(--radius)',
                    background: 'var(--bg3)', textDecoration: 'none',
                    transition: 'all 0.15s', border: '1px solid transparent'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(124,58,237,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'var(--bg3)' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{item.desc}</div>
                    </div>
                    <span style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent bookings */}
      <div className="card">
        <div style={{ padding: '1.25rem 1.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3>Recent Bookings</h3>
          <Link to="/admin/bookings" style={{ fontSize: '0.85rem', color: 'var(--accent3)', textDecoration: 'none' }}>View all →</Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
            <div className="empty-state-icon" style={{ fontSize: '2rem' }}>🎫</div>
            <h3>No bookings yet</h3>
            <p>Bookings will appear here once users start booking tickets</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ref</th><th>Event</th><th>Customer</th><th>Qty</th><th>Amount</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(b => (
                  <tr key={b.id}>
                    <td><code style={{ color: 'var(--accent3)', fontSize: '0.78rem', background: 'rgba(124,58,237,0.1)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>{b.booking_ref}</code></td>
                    <td style={{ color: 'var(--text)', fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.event?.title || '—'}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{b.user?.name || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{b.user?.email}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{b.quantity}</td>
                    <td style={{ color: 'var(--accent2)', fontWeight: 700 }}>₹{b.total_amount?.toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${statusColors[b.status] || 'badge-blue'}`}>{b.status}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>
                      {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
