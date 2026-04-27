import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import EventCard from '../components/EventCard'

const CATEGORIES = ['All', 'Technology', 'Music', 'Business', 'Sports', 'Wellness', 'General', 'Arts']

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (category !== 'All') params.append('category', category)
    setLoading(true)
    api.get(`/events?${params}`).then(r => setEvents(r.data)).finally(() => setLoading(false))
    // Sync URL params
    const newParams = {}
    if (search) newParams.search = search
    if (category !== 'All') newParams.category = category
    setSearchParams(newParams, { replace: true })
  }, [search, category])

  // Pick up URL changes (e.g. from Home page category links)
  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat && cat !== category) setCategory(cat)
    const s = searchParams.get('search')
    if (s && s !== search) setSearch(s)
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Discover Events</h1>
        <p className="page-subtitle">Find and book unforgettable experiences near you</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>🔍</span>
          <input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: '0.5rem 1rem', borderRadius: 100, border: 'none', cursor: 'pointer',
              background: category === c ? 'var(--accent)' : 'var(--bg3)',
              color: category === c ? 'white' : 'var(--text2)',
              fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.15s'
            }}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎪</div>
          <h3>No events found</h3>
          <p>Try adjusting your search or filters</p>
          {category !== 'All' && (
            <button onClick={() => setCategory('All')} className="btn btn-outline" style={{ marginTop: '1rem' }}>
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {events.length} event{events.length !== 1 ? 's' : ''} found
            {category !== 'All' && <span> in <strong style={{ color: 'var(--accent3)' }}>{category}</strong></span>}
          </p>
          <div className="grid-3">
            {events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </>
      )}
    </div>
  )
}
