from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
import uuid
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def create_notification(db: Session, user_id: int, title: str, message: str, ntype: str = "info"):
    n = models.Notification(user_id=user_id, title=title, message=message, notification_type=ntype)
    db.add(n)


@router.post("", response_model=schemas.BookingOut, status_code=201)
def create_booking(
    booking_data: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Lock the event row to prevent race conditions
    event = db.query(models.Event).filter(
        models.Event.id == booking_data.event_id,
        models.Event.is_active == True
    ).with_for_update().first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if booking_data.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    if event.available_tickets < booking_data.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {event.available_tickets} ticket(s) available"
        )

    # Check if user already has a confirmed booking for this event
    existing = db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id,
        models.Booking.event_id == booking_data.event_id,
        models.Booking.status.in_(["confirmed", "pending"])
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have a booking for this event")

    total = event.price * booking_data.quantity
    booking_ref = f"BK-{uuid.uuid4().hex[:8].upper()}"

    booking = models.Booking(
        user_id=current_user.id,
        event_id=booking_data.event_id,
        quantity=booking_data.quantity,
        total_amount=total,
        status="pending",
        booking_ref=booking_ref
    )
    db.add(booking)
    event.available_tickets -= booking_data.quantity

    create_notification(
        db, current_user.id,
        "Booking Created",
        f"Your booking for '{event.title}' (Ref: {booking_ref}) has been created. Complete payment to confirm.",
        "booking"
    )

    db.commit()
    db.refresh(booking)
    return booking


@router.get("", response_model=List[schemas.BookingOut])
def list_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin)
):
    return db.query(models.Booking).order_by(models.Booking.created_at.desc()).all()


@router.get("/my", response_model=List[schemas.BookingOut])
def my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id
    ).order_by(models.Booking.created_at.desc()).all()


# Alias: GET /my-bookings (as per spec Module 6)
@router.get("/my-bookings", response_model=List[schemas.BookingOut])
def my_bookings_alias(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id
    ).order_by(models.Booking.created_at.desc()).all()


@router.get("/{booking_id}", response_model=schemas.BookingOut)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return booking


@router.post("/{booking_id}/cancel", response_model=schemas.BookingOut)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Booking already cancelled")

    event = db.query(models.Event).filter(models.Event.id == booking.event_id).first()
    booking.status = "cancelled"
    if event:
        event.available_tickets += booking.quantity

    create_notification(
        db, booking.user_id,
        "Booking Cancelled",
        f"Your booking (Ref: {booking.booking_ref}) has been cancelled. Tickets have been released.",
        "cancellation"
    )

    db.commit()
    db.refresh(booking)
    return booking
