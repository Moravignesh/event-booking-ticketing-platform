from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth
from datetime import datetime, timedelta
from calendar import monthrange

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/analytics/events", response_model=List[schemas.EventAnalytics])
def events_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin)
):
    events = db.query(models.Event).all()
    result = []
    for event in events:
        bookings = db.query(models.Booking).filter(
            models.Booking.event_id == event.id
        ).all()
        confirmed  = [b for b in bookings if b.status == "confirmed"]
        cancelled  = [b for b in bookings if b.status == "cancelled"]
        tickets_sold = sum(b.quantity for b in confirmed)
        revenue      = sum(b.total_amount for b in confirmed)
        result.append(schemas.EventAnalytics(
            event_id=event.id,
            title=event.title,
            total_bookings=len(bookings),
            confirmed_bookings=len(confirmed),
            cancelled_bookings=len(cancelled),
            tickets_sold=tickets_sold,
            revenue=revenue,
            available_tickets=event.available_tickets,
            total_tickets=event.total_tickets
        ))
    return result


@router.get("/analytics/revenue", response_model=schemas.RevenueAnalytics)
def revenue_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin)
):
    all_bookings = db.query(models.Booking).all()
    confirmed    = [b for b in all_bookings if b.status == "confirmed"]
    pending      = [b for b in all_bookings if b.status == "pending"]
    cancelled    = [b for b in all_bookings if b.status == "cancelled"]

    confirmed_revenue = round(sum(b.total_amount for b in confirmed), 2)
    pending_revenue   = round(sum(b.total_amount for b in pending),   2)
    total_revenue     = round(confirmed_revenue + pending_revenue,     2)

    # Monthly revenue — last 6 DISTINCT calendar months
    monthly_revenue = []
    now = datetime.utcnow()
    for i in range(5, -1, -1):
        # Walk back month by month correctly
        month_date = (now.replace(day=1) - timedelta(days=1)) if i == 0 else now
        # Compute the target month
        target_month = now.month - i
        target_year  = now.year
        while target_month <= 0:
            target_month += 12
            target_year  -= 1

        month_start = datetime(target_year, target_month, 1, 0, 0, 0)
        last_day    = monthrange(target_year, target_month)[1]
        month_end   = datetime(target_year, target_month, last_day, 23, 59, 59)

        month_confirmed = [
            b for b in confirmed
            if b.created_at and
               month_start <= b.created_at.replace(tzinfo=None) <= month_end
        ]
        monthly_revenue.append({
            "month":    month_start.strftime("%b %Y"),
            "revenue":  round(sum(b.total_amount for b in month_confirmed), 2),
            "bookings": len(month_confirmed)
        })

    total_events  = db.query(models.Event).count()
    active_events = db.query(models.Event).filter(
        models.Event.is_active == True
    ).count()

    return schemas.RevenueAnalytics(
        total_revenue=total_revenue,
        confirmed_revenue=confirmed_revenue,
        pending_revenue=pending_revenue,
        total_bookings=len(all_bookings),
        confirmed_bookings=len(confirmed),
        cancelled_bookings=len(cancelled),
        total_events=total_events,
        active_events=active_events,
        monthly_revenue=monthly_revenue
    )


@router.get("/users", response_model=List[schemas.UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin)
):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()
