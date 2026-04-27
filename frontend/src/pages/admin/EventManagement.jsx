import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const CATEGORIES = ['Technology', 'Music', 'Business', 'Sports', 'Wellness', 'Arts', 'General']
const EMPTY_FORM = { title: '', description: '', date: '', location: '', total_tickets: '', price: '', image_url: '', category: 'General' }

const categoryColors = {
  Technology:'#60a5fa', Music:'#c084fc', Business:'#fbbf24',
  Sports:'#34d399', Wellness:'#f472b6', Arts:'#fb923c', General:'#9ca3af'
}

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [view, setView] = useState('grid') // 'grid' or 'table'

  const load = () => {
    setLoading(true)
    api.get('/events/all').then(r => setEvents(r.data)).catch(() => toast.error('Failed to load events')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true) }
  const openEdit = (e) => {
    setEditing(e)
    const d = new Date(e.date)
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    setForm({
      title: e.title, description: e.description || '',
      date: local, location: e.location,
      total_tickets: e.total_tickets, price: e.price,
      image_url: e.image_url || '', category: e.category || 'General'
    })
    setModal(true)
  }

  const handleSave = async e => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.date) return toast.error('Date is required')
    if (Number(form.price) < 0) return toast.error('Price cannot be negative')
    if (Number(form.total_tickets) < 1) return toast.error('Must have at least 1 ticket')
    setSaving(true)
    try {
      const payload = { ...form, total_tickets: Number(form.total_tickets), price: Number(form.price) }
      if (editing) {
        await api.put(`/events/${editing.id}`, payload)
        toast.success('✅ Event updated!')
      } else {
        await api.post('/events', payload)
        toast.success('✅ Event created!')
      }
      setModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?\n\nThis will deactivate the event and cannot be undone.`)) return
    setDeleting(id)
    try {
      await api.delete(`/events/${id}`)
      toast.success('Event deleted')
      load()
    } catch { toast.error('Delete failed') }
    finally { setDeleting(null) }
  }

  const handleToggleStatus = async (e) => {
    try {
      await api.put(`/events/${e.id}`, { is_active: !e.is_active })
      toast.success(e.is_active ? 'Event deactivated' : 'Event activated')
      load()
    } catch { toast.error('Failed to update status') }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Event Management</h1>
          <p className="page-subtitle">{events.length} events · {events.filter(e => e.is_active).length} active</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 8, padding: 3, border: '1px solid var(--border)' }}>
            {[['grid', '⊞'], ['table', '☰']].map(([v, icon]) => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '0.3rem 0.65rem', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: view === v ? 'var(--accent)' : 'transparent',
                color: view === v ? 'white' : 'var(--text2)',
                fontSize: '0.95rem', transition: 'all 0.15s'
              }}>{icon}</button>
            ))}
          </div>
          <button onClick={openCreate} className="btn btn-primary">+ Create Event</button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎪</div>
          <h3>No events yet</h3>
          <p>Create your first event to get started</p>
          <button onClick={openCreate} className="btn btn-primary" style={{ marginTop: '1rem' }}>+ Create First Event</button>
        </div>
      ) : view === 'grid' ? (
        /* ── GRID VIEW ── */
        <div className="grid-3">
          {events.map(e => {
            const sold = e.total_tickets - e.available_tickets
            const soldPct = Math.round((sold / e.total_tickets) * 100)
            const catColor = categoryColors[e.category] || '#9ca3af'
            return (
              <div key={e.id} className="card" style={{ display: 'flex', flexDirection: 'column', opacity: e.is_active ? 1 : 0.6 }}>
                {/* Image */}
                <div style={{ position: 'relative', paddingTop: '48%', background: 'var(--bg3)', overflow: 'hidden', flexShrink: 0 }}>
                  {e.image_url ? (
                    <img src={e.image_url} alt={e.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={ev => ev.target.style.display='none'} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: 'linear-gradient(135deg,var(--bg3),var(--bg2))' }}>🎪</div>
                  )}
                  <div style={{ position: 'absolute', top: 8, left: 8, background: `${catColor}25`, color: catColor, padding: '0.2rem 0.6rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 600, border: `1px solid ${catColor}40`, backdropFilter: 'blur(4px)' }}>{e.category}</div>
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <span className={`badge ${e.is_active ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.7rem' }}>
                      {e.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.3 }}>{e.title}</h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text3)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div>📅 {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    <div>📍 {e.location}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--accent2)', fontWeight: 700 }}>₹{e.price.toLocaleString('en-IN')}</span>
                    <span style={{ color: 'var(--text3)' }}>{e.available_tickets}/{e.total_tickets} left</span>
                  </div>

                  <div>
                    <div className="progress-bar" style={{ height: 5 }}>
                      <div className="progress-fill" style={{ width: `${soldPct}%`, background: soldPct > 80 ? 'var(--red)' : soldPct > 50 ? 'var(--gold)' : undefined }} />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '0.25rem' }}>{soldPct}% sold · {sold} booked</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => openEdit(e)} className="btn btn-outline btn-sm" style={{ flex: 1, fontSize: '0.78rem' }}>✏️ Edit</button>
                    <button onClick={() => handleToggleStatus(e)} className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: '0.78rem' }}>
                      {e.is_active ? '🔕 Deactivate' : '✅ Activate'}
                    </button>
                    <button onClick={() => handleDelete(e.id, e.title)} className="btn btn-danger btn-sm" style={{ fontSize: '0.78rem' }} disabled={deleting === e.id}>
                      {deleting === e.id ? '⏳' : '🗑'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Event</th><th>Date</th><th>Price</th><th>Tickets</th><th>Sold %</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {events.map(e => {
                  const sold = e.total_tickets - e.available_tickets
                  const soldPct = Math.round((sold / e.total_tickets) * 100)
                  return (
                    <tr key={e.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: 52, height: 40, borderRadius: 6, overflow: 'hidden', background: 'var(--bg3)', flexShrink: 0 }}>
                            {e.image_url
                              ? <img src={e.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={ev => ev.target.style.display='none'} />
                              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🎪</div>
                            }
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{e.category} · {e.location}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td style={{ color: 'var(--accent2)', fontWeight: 700 }}>₹{e.price.toLocaleString('en-IN')}</td>
                      <td style={{ fontSize: '0.85rem' }}>{e.available_tickets}/{e.total_tickets}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 80 }}>
                          <div className="progress-bar" style={{ flex: 1 }}><div className="progress-fill" style={{ width: `${soldPct}%` }} /></div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text3)', minWidth: 28 }}>{soldPct}%</span>
                        </div>
                      </td>
                      <td><span className={`badge ${e.is_active ? 'badge-green' : 'badge-red'}`}>{e.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => openEdit(e)} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>✏️</button>
                          <button onClick={() => handleDelete(e.id, e.title)} className="btn btn-danger btn-sm" style={{ fontSize: '0.75rem' }} disabled={deleting === e.id}>
                            {deleting === e.id ? '⏳' : '🗑'}
                          </button>
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

      {/* ── Create / Edit Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => !saving && setModal(false)}>
          <div className="modal fade-in" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? '✏️ Edit Event' : '➕ Create New Event'}</h3>
              <button onClick={() => setModal(false)} className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem' }} disabled={saving}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                {/* Image preview */}
                {form.image_url && (
                  <div style={{ marginBottom: '1.25rem', borderRadius: 'var(--radius)', overflow: 'hidden', maxHeight: 180, position: 'relative' }}>
                    <img src={form.image_url} alt="Preview" style={{ width: '100%', height: 180, objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                    <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: 100 }}>Image Preview</div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="e.g. Tech Summit 2025" />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Date & Time *</label>
                    <input type="datetime-local" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} required placeholder="Venue name and city" />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Ticket Price (₹) *</label>
                    <input type="number" min="0" step="1" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required placeholder="499" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Tickets *</label>
                    <input type="number" min="1" value={form.total_tickets} onChange={e => setForm(p => ({ ...p, total_tickets: e.target.value }))} required placeholder="100" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(paste any image link)</span></label>
                  <input
                    value={form.image_url}
                    onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {!form.image_url && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.4rem' }}>
                      💡 Tip: Use <a href="https://unsplash.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent3)' }}>Unsplash</a> for free images. Copy the image URL and paste here.
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description</label>
                  <textarea
                    rows={4} value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the event, what to expect, schedule, etc."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModal(false)} className="btn btn-outline" disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: 140 }}>
                  {saving ? '⏳ Saving...' : editing ? '✓ Update Event' : '+ Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
