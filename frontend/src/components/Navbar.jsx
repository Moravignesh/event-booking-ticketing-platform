import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifCount, setNotifCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(r => {
        setNotifCount(r.data.filter(n => !n.is_read).length)
      }).catch(() => {})
    }
  }, [user, location.pathname])

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { setMenuOpen(false); logout(); navigate('/login') }

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  const adminLinks = [
    { to: '/admin', label: '🏠 Dashboard' },
    { to: '/admin/events', label: '🎪 Events' },
    { to: '/admin/bookings', label: '🎫 Bookings' },
    { to: '/admin/analytics', label: '📊 Analytics' },
  ]
  const userLinks = [
    { to: '/events', label: '🔍 Browse Events' },
    { to: '/my-bookings', label: '🎫 My Bookings' },
  ]
  const navLinks = isAdmin ? adminLinks : userLinks

  return (
    <nav style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: 64, gap: '0.5rem' }}>

        <Link to={user ? (isAdmin ? '/admin' : '/events') : '/'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1.5rem', flexShrink: 0, textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>⚡</div>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Event<span style={{ color: 'var(--accent2)' }}>X</span>
          </span>
        </Link>

        {user && (
          <div style={{ display: 'flex', gap: '0.15rem', flex: 1, overflowX: 'auto' }}>
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} style={{
                padding: '0.45rem 0.85rem', borderRadius: 8, whiteSpace: 'nowrap',
                color: isActive(l.to) ? 'var(--text)' : 'var(--text2)',
                background: isActive(l.to) ? 'rgba(124,58,237,0.2)' : 'transparent',
                borderBottom: isActive(l.to) ? '2px solid var(--accent2)' : '2px solid transparent',
                fontSize: '0.88rem', fontWeight: isActive(l.to) ? 600 : 400,
                transition: 'all 0.15s', textDecoration: 'none', display: 'inline-flex', alignItems: 'center'
              }}>{l.label}</Link>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', flexShrink: 0 }}>
          {user ? (
            <>
              <Link to="/notifications" title="Notifications" style={{
                position: 'relative', padding: '0.45rem 0.55rem', borderRadius: 8,
                color: isActive('/notifications') ? 'var(--text)' : 'var(--text2)',
                background: isActive('/notifications') ? 'rgba(124,58,237,0.2)' : 'transparent',
                display: 'flex', alignItems: 'center', transition: 'all 0.15s', textDecoration: 'none', fontSize: '1.1rem'
              }}>
                🔔
                {notifCount > 0 && (
                  <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 17, height: 17, background: 'var(--accent)', borderRadius: '50%', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, padding: '0 3px' }}>
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </Link>

              <div style={{ position: 'relative' }} ref={menuRef}>
                <button onClick={() => setMenuOpen(o => !o)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: menuOpen ? 'var(--bg3)' : 'transparent',
                  border: '1px solid', borderColor: menuOpen ? 'var(--border2)' : 'transparent',
                  borderRadius: 100, padding: '0.35rem 0.75rem 0.35rem 0.4rem',
                  color: 'var(--text)', cursor: 'pointer', transition: 'all 0.15s'
                }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  {isAdmin && <span className="badge badge-purple" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>Admin</span>}
                  <span style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>{menuOpen ? '▲' : '▼'}</span>
                </button>

                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '0.4rem', minWidth: 210, zIndex: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                    <div style={{ padding: '0.6rem 0.75rem 0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '0.3rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.1rem' }}>{user.email}</div>
                      <span className={`badge ${isAdmin ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: '0.68rem', marginTop: '0.4rem', display: 'inline-flex' }}>
                        {isAdmin ? '👑 Admin' : '👤 User'}
                      </span>
                    </div>

                    {[
                      { to: '/notifications', icon: '🔔', label: 'Notifications', badge: notifCount },
                      ...(!isAdmin ? [{ to: '/my-bookings', icon: '🎫', label: 'My Bookings' }] : []),
                      ...(!isAdmin ? [{ to: '/events', icon: '🔍', label: 'Browse Events' }] : []),
                    ].map(item => (
                      <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem',
                        borderRadius: 8, fontSize: '0.88rem', color: 'var(--text2)',
                        transition: 'all 0.15s', textDecoration: 'none'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)' }}
                      >
                        {item.icon} {item.label}
                        {item.badge > 0 && <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: 'white', borderRadius: 100, fontSize: '0.68rem', padding: '0 6px', fontWeight: 700 }}>{item.badge}</span>}
                      </Link>
                    ))}

                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.3rem', paddingTop: '0.3rem' }}>
                      <button onClick={handleLogout} style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.5rem 0.75rem', borderRadius: 8, fontSize: '0.88rem',
                        color: 'var(--red)', background: 'transparent', border: 'none',
                        cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        🚪 Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
