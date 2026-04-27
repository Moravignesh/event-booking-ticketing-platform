import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

export default function BookingSuccess() {
  const [params] = useSearchParams()
  const bookingId = params.get('booking_id')
  const ref = params.get('ref')
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    if (bookingId) {
      api.get(`/bookings/${bookingId}`).then(r => setBooking(r.data)).catch(() => {})
    }
  }, [bookingId])

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }} className="fade-in">
        <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'fadeIn 0.5s ease' }}>🎉</div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.75rem', color: 'var(--green)' }}>Booking Confirmed!</h1>
        <p style={{ color: 'var(--text2)', marginBottom: '2rem', lineHeight: 1.7 }}>
          Your tickets have been successfully booked. Check your bookings for details.
        </p>

        {booking && (
          <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text2)', flexDirection: 'column' }}>
                <div><strong style={{ color: 'var(--text)' }}>Event:</strong> {booking.event?.title}</div>
                <div><strong style={{ color: 'var(--text)' }}>Booking Ref:</strong> <span style={{ color: 'var(--accent2)', fontWeight: 700 }}>{booking.booking_ref}</span></div>
                <div><strong style={{ color: 'var(--text)' }}>Tickets:</strong> {booking.quantity}</div>
                <div><strong style={{ color: 'var(--text)' }}>Total:</strong> ₹{booking.total_amount?.toLocaleString('en-IN')}</div>
                <div><strong style={{ color: 'var(--text)' }}>Status:</strong> <span className="badge badge-green">{booking.status}</span></div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/my-bookings" className="btn btn-primary btn-lg">📋 View My Bookings</Link>
          <Link to="/events" className="btn btn-outline btn-lg">🔍 Browse More Events</Link>
        </div>
      </div>
    </div>
  )
}
