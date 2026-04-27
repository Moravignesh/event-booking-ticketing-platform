import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function AdminAnalytics() {
  const [revenue, setRevenue] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    Promise.all([api.get('/admin/analytics/revenue'), api.get('/admin/analytics/events')])
      .then(([r, e]) => { setRevenue(r.data); setEvents(e.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Revenue, bookings, and event performance</p>
      </div>

      <div className="tabs">
        {['overview', 'events', 'revenue'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && revenue && (
        <div className="fade-in">
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            {[
              { label: 'Confirmed Revenue', value: `₹${revenue.confirmed_revenue.toLocaleString('en-IN')}`, icon: '💰', color: 'var(--green)' },
              { label: 'Pending Revenue', value: `₹${revenue.pending_revenue.toLocaleString('en-IN')}`, icon: '⏳', color: 'var(--gold)' },
              { label: 'Confirmed Bookings', value: revenue.confirmed_bookings, icon: '✅', color: 'var(--blue)' },
              { label: 'Cancellation Rate', value: `${revenue.total_bookings > 0 ? Math.round(revenue.cancelled_bookings/revenue.total_bookings*100) : 0}%`, icon: '📉', color: 'var(--red)' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Booking breakdown */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-body">
              <h3 style={{ marginBottom: '1.25rem' }}>Booking Status Breakdown</h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
                {[
                  { label: 'Confirmed', count: revenue.confirmed_bookings, color: 'var(--green)' },
                  { label: 'Pending', count: revenue.total_bookings - revenue.confirmed_bookings - revenue.cancelled_bookings, color: 'var(--gold)' },
                  { label: 'Cancelled', count: revenue.cancelled_bookings, color: 'var(--red)' },
                ].map(s => {
                  const pct = revenue.total_bookings > 0 ? Math.round((s.count / revenue.total_bookings) * 100) : 0
                  return (
                    <div key={s.label} style={{ flex: 1, background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '1.25rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-head)' }}>{s.count}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: '0.25rem' }}>{s.label}</div>
                      <div style={{ marginTop: '0.75rem' }}>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%`, background: s.color }} /></div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.25rem' }}>{pct}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Monthly chart */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: '1.5rem' }}>Monthly Revenue Trend</h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', height: 200 }}>
                {revenue.monthly_revenue.map((m, i) => {
                  const max = Math.max(...revenue.monthly_revenue.map(x => x.revenue), 1)
                  const h = Math.max((m.revenue / max) * 170, 6)
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)', textAlign: 'center' }}>
                        {m.bookings} bookings<br />₹{m.revenue > 0 ? (m.revenue/1000).toFixed(1)+'k' : '0'}
                      </div>
                      <div title={`₹${m.revenue}`} style={{
                        width: '100%', height: h,
                        background: 'linear-gradient(180deg, var(--accent3) 0%, var(--accent) 100%)',
                        borderRadius: '6px 6px 0 0', cursor: 'default', transition: 'opacity 0.2s'
                      }} onMouseEnter={e => e.currentTarget.style.opacity='0.7'} onMouseLeave={e => e.currentTarget.style.opacity='1'} />
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{m.month.split(' ')[0]}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {tab === 'events' && (
        <div className="fade-in card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Event</th><th>Total Bookings</th><th>Confirmed</th><th>Cancelled</th><th>Tickets Sold</th><th>Revenue</th><th>Fill Rate</th></tr></thead>
              <tbody>
                {events.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>No data available</td></tr>
                ) : events.map(e => {
                  const fillRate = e.total_tickets > 0 ? Math.round((e.tickets_sold / e.total_tickets) * 100) : 0
                  return (
                    <tr key={e.event_id}>
                      <td style={{ fontWeight: 600, color: 'var(--text)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</td>
                      <td>{e.total_bookings}</td>
                      <td><span style={{ color: 'var(--green)', fontWeight: 600 }}>{e.confirmed_bookings}</span></td>
                      <td><span style={{ color: 'var(--red)' }}>{e.cancelled_bookings}</span></td>
                      <td>{e.tickets_sold} / {e.total_tickets}</td>
                      <td style={{ color: 'var(--accent2)', fontWeight: 600 }}>₹{e.revenue.toLocaleString('en-IN')}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="progress-bar" style={{ minWidth: 60 }}><div className="progress-fill" style={{ width: `${fillRate}%` }} /></div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{fillRate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {tab === 'revenue' && revenue && (
        <div className="fade-in">
          <div className="grid-2" style={{ gap: '1.5rem' }}>
            <div className="card">
              <div className="card-body">
                <h3 style={{ marginBottom: '1.25rem' }}>Revenue Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: 'Confirmed Revenue', value: revenue.confirmed_revenue, color: 'var(--green)' },
                    { label: 'Pending Revenue', value: revenue.pending_revenue, color: 'var(--gold)' },
                    { label: 'Total Revenue', value: revenue.total_revenue, color: 'var(--accent2)' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg3)', borderRadius: 'var(--radius)' }}>
                      <span style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>{r.label}</span>
                      <span style={{ fontWeight: 800, color: r.color, fontFamily: 'var(--font-head)' }}>₹{r.value.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h3 style={{ marginBottom: '1.25rem' }}>Monthly Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {revenue.monthly_revenue.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--bg3)', borderRadius: 8 }}>
                      <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{m.month}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--accent2)', fontSize: '0.9rem' }}>₹{m.revenue.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{m.bookings} booking{m.bookings !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
