import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user' })
  const [loading, setLoading] = useState(false)

  const handle = async e => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password, role: form.role })
      toast.success(`Welcome, ${user.name}! Account created.`)
      navigate(user.role === 'admin' ? '/admin' : '/events')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 70%)' }}>
      <div style={{ width: '100%', maxWidth: 440 }} className="fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem' }}>⚡</div>
          <h1 style={{ fontSize: '1.75rem' }}>Create account</h1>
          <p style={{ color: 'var(--text2)', marginTop: '0.4rem', fontSize: '0.9rem' }}>Join EventX and start booking experiences</p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handle}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" placeholder="John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
              </div>

              {/* Role selector */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Account Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
                  {[
                    { value: 'user', icon: '👤', title: 'User', desc: 'Browse & book events' },
                    { value: 'admin', icon: '👑', title: 'Admin', desc: 'Manage events & platform' },
                  ].map(r => (
                    <div key={r.value} onClick={() => setForm(p => ({ ...p, role: r.value }))} style={{
                      padding: '0.85rem', borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.15s',
                      border: `2px solid ${form.role === r.value ? 'var(--accent)' : 'var(--border)'}`,
                      background: form.role === r.value ? 'rgba(124,58,237,0.1)' : 'var(--bg3)',
                    }}>
                      <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>{r.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.15rem' }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? '⏳ Creating...' : `→ Create ${form.role === 'admin' ? 'Admin' : 'User'} Account`}
              </button>
            </form>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text2)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent3)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
