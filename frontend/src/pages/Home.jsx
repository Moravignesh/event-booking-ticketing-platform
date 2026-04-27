import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  const cats = [
    { icon: '💻', label: 'Technology', color: '#3b82f6' },
    { icon: '🎵', label: 'Music', color: '#a855f7' },
    { icon: '💼', label: 'Business', color: '#f59e0b' },
    { icon: '⚽', label: 'Sports', color: '#10b981' },
    { icon: '🧘', label: 'Wellness', color: '#ec4899' },
    { icon: '🎨', label: 'Arts', color: '#f97316' },
  ]

  // If already logged in, redirect to correct home
  const handleExplore = () => {
    if (user && isAdmin) navigate('/admin')
    else navigate('/events')
  }

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'radial-gradient(ellipse at 50% -20%, rgba(124,58,237,0.4) 0%, transparent 65%), radial-gradient(ellipse at 80% 60%, rgba(168,85,247,0.18) 0%, transparent 50%)',
        padding: '7rem 1.5rem 5rem', textAlign: 'center'
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }} className="fade-in">
          <div className="badge badge-purple" style={{ marginBottom: '1.5rem', fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
            ⚡ The ultimate event experience platform
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Book Events<br /><span style={{ background: 'linear-gradient(135deg, var(--accent2), #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>You'll Remember</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text2)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 2.5rem' }}>
            Discover concerts, conferences, sports events, and more. Book tickets instantly and never miss what matters.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleExplore} className="btn btn-primary btn-lg">
              {user && isAdmin ? '🏠 Go to Dashboard' : '🔍 Explore Events'} →
            </button>
            {!user && <Link to="/register" className="btn btn-outline btn-lg">Create Free Account</Link>}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1.75rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          {[['1000+', 'Events Hosted'], ['50K+', 'Happy Attendees'], ['100+', 'Cities'], ['4.9★', 'Avg Rating']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-head)', color: 'var(--accent2)' }}>{v}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '0.15rem' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding: '5rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Browse by Category</h2>
          <p style={{ color: 'var(--text2)' }}>Find events that match your interests</p>
        </div>
        <div className="grid-3">
          {cats.map(c => (
            <Link key={c.label} to={`/events?category=${c.label}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = c.color }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.3rem' }}>
                  <div style={{ fontSize: '1.75rem', width: 52, height: 52, borderRadius: 12, background: `${c.color}18`, border: `1px solid ${c.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{c.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '0.1rem' }}>Browse events →</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>How it works</h2>
          <p style={{ color: 'var(--text2)', marginBottom: '3rem' }}>Book your next experience in 3 simple steps</p>
          <div className="grid-3" style={{ gap: '2rem' }}>
            {[
              { step: '01', icon: '🔍', title: 'Browse Events', desc: 'Explore hundreds of events by category, date, or location.' },
              { step: '02', icon: '🎫', title: 'Book Tickets', desc: 'Select your seats and quantity. Instant availability check.' },
              { step: '03', icon: '🎉', title: 'Attend & Enjoy', desc: 'Get your booking confirmation and enjoy the experience!' },
            ].map(s => (
              <div key={s.step} style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent2)', letterSpacing: '0.1em', marginBottom: '0.75rem', fontFamily: 'var(--font-head)' }}>STEP {s.step}</div>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{s.icon}</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      {!user && (
        <div style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.1))', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 'var(--radius-lg)', padding: '3rem 2rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Ready to get started?</h2>
            <p style={{ color: 'var(--text2)', marginBottom: '2rem', lineHeight: 1.7 }}>
              Join thousands of event lovers. Create your account and book your first experience today.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">🚀 Create Free Account</Link>
              <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
