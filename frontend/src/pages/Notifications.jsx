import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

const typeConfig = {
  booking:      { icon: '🎫', cls: 'badge-purple', label: 'Booking' },
  payment:      { icon: '💳', cls: 'badge-green',  label: 'Payment' },
  cancellation: { icon: '❌', cls: 'badge-red',    label: 'Cancelled' },
  info:         { icon: 'ℹ️', cls: 'badge-blue',   label: 'Info' },
}

export default function Notifications() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  const load = () => {
    api.get('/notifications').then(r => setNotifs(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const markAllRead = async () => {
    await api.post('/notifications/read-all')
    setNotifs(n => n.map(x => ({ ...x, is_read: true })))
    toast.success('All notifications marked as read')
  }

  const markRead = async (id) => {
    await api.post(`/notifications/${id}/read`)
    setNotifs(n => n.map(x => x.id === id ? { ...x, is_read: true } : x))
  }

  const filtered = filter === 'all' ? notifs : filter === 'unread' ? notifs.filter(n => !n.is_read) : notifs.filter(n => n.notification_type === filter)
  const unread = notifs.filter(n => !n.is_read).length

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Notifications</h1>
            {unread > 0 && (
              <span style={{ background: 'var(--accent)', color: 'white', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.65rem' }}>
                {unread} new
              </span>
            )}
          </div>
          <p className="page-subtitle">Stay updated on your bookings and payments</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn btn-outline btn-sm">✓ Mark all as read</button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { value: 'all', label: `All (${notifs.length})` },
          { value: 'unread', label: `Unread (${unread})` },
          { value: 'booking', label: '🎫 Booking' },
          { value: 'payment', label: '💳 Payment' },
          { value: 'cancellation', label: '❌ Cancellation' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} style={{
            padding: '0.45rem 1rem', borderRadius: 100, border: 'none', cursor: 'pointer',
            background: filter === f.value ? 'var(--accent)' : 'var(--bg3)',
            color: filter === f.value ? 'white' : 'var(--text2)',
            fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.15s'
          }}>{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <h3>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</h3>
          <p>You'll receive updates about your bookings and payments here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filtered.map(n => {
            const cfg = typeConfig[n.notification_type] || typeConfig.info
            return (
              <div key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className="card fade-in"
                style={{
                  cursor: !n.is_read ? 'pointer' : 'default',
                  borderColor: !n.is_read ? 'rgba(124,58,237,0.5)' : 'var(--border)',
                  background: !n.is_read ? 'rgba(124,58,237,0.04)' : 'var(--bg2)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { if (!n.is_read) e.currentTarget.style.borderColor = 'var(--accent2)' }}
                onMouseLeave={e => { if (!n.is_read) e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)' }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem 1.25rem' }}>
                  {/* Icon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', flexShrink: 0
                  }}>{cfg.icon}</div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{n.title}</span>
                      <span className={`badge ${cfg.cls}`} style={{ fontSize: '0.72rem' }}>{cfg.label}</span>
                      {!n.is_read && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent2)', flexShrink: 0, display: 'inline-block' }} />
                      )}
                    </div>
                    <p style={{ color: 'var(--text2)', fontSize: '0.87rem', lineHeight: 1.6, marginBottom: '0.4rem' }}>{n.message}</p>
                    <p style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>
                      {new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {!n.is_read && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent3)', whiteSpace: 'nowrap', marginTop: '0.15rem' }}>Click to read</div>
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
