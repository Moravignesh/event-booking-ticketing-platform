import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login, user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  // Already logged in
  if (user) return <Navigate to={isAdmin ? '/admin' : '/events'} replace />

  const handle = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const u = await login(form.email, form.password)
      toast.success(`Welcome back, ${u.name}!`)
      navigate(u.role === 'admin' ? '/admin' : '/events', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  const fillDemo = (type) => {
    if (type === 'admin') setForm({ email: 'admin@eventbooking.com', password: 'admin123' })
    else setForm({ email: 'user@eventbooking.com', password: 'user123' })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 70%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem' }}>⚡</div>
          <h1 style={{ fontSize: '1.75rem' }}>Welcome back</h1>
          <p style={{ color: 'var(--text2)', marginTop: '0.4rem', fontSize: '0.9rem' }}>Sign in to your EventX account</p>
        </div>

        {/* Demo credentials */}
        <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text3)', marginBottom: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            🔑 Demo Credentials
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => fillDemo('admin')} className="btn btn-outline btn-sm" style={{ flex: 1, fontSize: '0.8rem' }}>
              👑 Admin Login
            </button>
            <button onClick={() => fillDemo('user')} className="btn btn-outline btn-sm" style={{ flex: 1, fontSize: '0.8rem' }}>
              👤 User Login
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handle}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" placeholder="••••••••" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.25rem' }} disabled={loading}>
                {loading ? '⏳ Signing in...' : '→ Sign In'}
              </button>
            </form>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text2)', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent3)', fontWeight: 600 }}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}
