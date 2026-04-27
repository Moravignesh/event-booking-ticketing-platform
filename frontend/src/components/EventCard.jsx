import { Link } from 'react-router-dom'

const categoryColors = {
  Technology: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  Music:      { bg: 'rgba(168,85,247,0.15)', color: '#c084fc' },
  Business:   { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  Sports:     { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
  Wellness:   { bg: 'rgba(236,72,153,0.15)', color: '#f472b6' },
  Arts:       { bg: 'rgba(249,115,22,0.15)', color: '#fb923c' },
  General:    { bg: 'rgba(156,163,175,0.15)', color: '#9ca3af' },
}

export default function EventCard({ event }) {
  const cat = categoryColors[event.category] || categoryColors.General
  const date = new Date(event.date)
  const soldPercent = Math.round(((event.total_tickets - event.available_tickets) / event.total_tickets) * 100)
  const isSoldOut = event.available_tickets === 0

  return (
    <Link
      to={`/events/${event.id}`}
      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
      <div
        className="card fade-in"
        style={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        {/* Image */}
        <div style={{ position: 'relative', paddingTop: '52%', overflow: 'hidden', background: 'var(--bg3)', flexShrink: 0 }}>
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: 'linear-gradient(135deg,var(--bg3),var(--bg2))' }}>🎪</div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.65) 100%)' }} />

          {/* Category */}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: cat.bg, color: cat.color, backdropFilter: 'blur(8px)', padding: '0.25rem 0.75rem', borderRadius: 100, fontSize: '0.73rem', fontWeight: 600, border: `1px solid ${cat.color}30` }}>
            {event.category}
          </div>

          {isSoldOut && (
            <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(239,68,68,0.92)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 100, fontSize: '0.73rem', fontWeight: 700 }}>
              SOLD OUT
            </div>
          )}
          {!isSoldOut && event.available_tickets <= 20 && (
            <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(245,158,11,0.9)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 100, fontSize: '0.73rem', fontWeight: 700 }}>
              ⚡ {event.available_tickets} left
            </div>
          )}

          {/* Date */}
          <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 100, fontSize: '0.72rem', fontWeight: 500 }}>
            📅 {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '1.1rem 1.2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div>
            <h3 style={{ fontSize: '0.97rem', fontWeight: 700, lineHeight: 1.35, marginBottom: '0.35rem', color: 'var(--text)' }}>
              {event.title}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text3)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
              {event.description}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text2)' }}>
            📍 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.location}</span>
          </div>

          {/* Availability bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text3)', marginBottom: '0.35rem' }}>
              <span>{event.available_tickets} tickets left</span>
              <span>{soldPercent}% sold</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{
                width: `${soldPercent}%`,
                background: soldPercent >= 90 ? 'var(--red)' : soldPercent >= 60 ? 'var(--gold)' : 'linear-gradient(90deg,var(--accent),var(--accent2))'
              }} />
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent2)', fontFamily: 'var(--font-head)' }}>
                ₹{event.price.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>per ticket</div>
            </div>
            <div style={{
              padding: '0.42rem 1rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
              background: isSoldOut ? 'var(--bg3)' : 'var(--accent)',
              color: isSoldOut ? 'var(--text3)' : 'white',
              border: isSoldOut ? '1px solid var(--border)' : 'none',
              pointerEvents: 'none'
            }}>
              {isSoldOut ? 'Sold Out' : '→ Book Now'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
