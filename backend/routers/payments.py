from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
import os
from dotenv import load_dotenv

load_dotenv()

STRIPE_SECRET_KEY    = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
FRONTEND_URL          = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Only import stripe when a real key is present
def _is_real_stripe():
    return (
        STRIPE_SECRET_KEY
        and not STRIPE_SECRET_KEY.startswith("sk_test_your")
        and not STRIPE_SECRET_KEY.startswith("sk_test_51")[:0]  # always False placeholder
        and len(STRIPE_SECRET_KEY) > 30
        and STRIPE_SECRET_KEY.startswith("sk_")
        and "your" not in STRIPE_SECRET_KEY.lower()
        and "placeholder" not in STRIPE_SECRET_KEY.lower()
    )

router = APIRouter(prefix="/payments", tags=["Payments"])


def create_notification(db: Session, user_id: int, title: str, message: str, ntype: str = "info"):
    n = models.Notification(user_id=user_id, title=title, message=message, notification_type=ntype)
    db.add(n)


def _mock_confirm(db: Session, booking: models.Booking, user_id: int):
    """Auto-confirm booking with mock payment (demo mode)."""
    booking.status = "confirmed"

    existing = db.query(models.Payment).filter(
        models.Payment.booking_id == booking.id
    ).first()

    if not existing:
        db.add(models.Payment(
            booking_id=booking.id,
            amount=booking.total_amount,
            status="completed",
            stripe_session_id=f"mock_{booking.booking_ref}"
        ))
    else:
        existing.status = "completed"

    create_notification(
        db, user_id,
        "✅ Payment Confirmed",
        f"Your booking {booking.booking_ref} is confirmed! See you at the event.",
        "payment"
    )
    db.commit()


@router.post("/create-session", response_model=schemas.CheckoutSession)
def create_checkout_session(
    payment_data: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    booking = db.query(models.Booking).filter(
        models.Booking.id == payment_data.booking_id,
        models.Booking.user_id == current_user.id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status == "confirmed":
        raise HTTPException(status_code=400, detail="Booking already paid and confirmed")
    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="This booking has been cancelled")

    # ── DEMO / MOCK MODE (no real Stripe key) ────────────────────────────────
    if not _is_real_stripe():
        _mock_confirm(db, booking, current_user.id)
        redirect = (
            f"{FRONTEND_URL}/booking-success"
            f"?booking_id={booking.id}&ref={booking.booking_ref}"
        )
        return {
            "checkout_url": redirect,
            "session_id": f"mock_{booking.booking_ref}",
            "booking_id": booking.id
        }

    # ── REAL STRIPE MODE ─────────────────────────────────────────────────────
    try:
        import stripe as stripe_lib
        stripe_lib.api_key = STRIPE_SECRET_KEY

        event_obj = db.query(models.Event).filter(
            models.Event.id == booking.event_id
        ).first()

        session = stripe_lib.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "inr",
                    "product_data": {
                        "name": event_obj.title if event_obj else "Event Ticket",
                        "description": f"Ref: {booking.booking_ref}",
                    },
                    "unit_amount": int(booking.total_amount * 100),
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=(
                f"{FRONTEND_URL}/booking-success"
                f"?booking_id={booking.id}&session_id={{CHECKOUT_SESSION_ID}}"
            ),
            cancel_url=f"{FRONTEND_URL}/my-bookings",
            metadata={
                "booking_id": str(booking.id),
                "user_id": str(current_user.id)
            },
        )

        payment = db.query(models.Payment).filter(
            models.Payment.booking_id == booking.id
        ).first()
        if not payment:
            db.add(models.Payment(
                booking_id=booking.id,
                amount=booking.total_amount,
                status="pending",
                stripe_session_id=session.id
            ))
        else:
            payment.stripe_session_id = session.id
        db.commit()

        return {
            "checkout_url": session.url,
            "session_id": session.id,
            "booking_id": booking.id
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment error: {str(e)}")


@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    if not STRIPE_WEBHOOK_SECRET or "your" in STRIPE_WEBHOOK_SECRET.lower():
        return {"status": "webhook not configured (demo mode)"}

    payload = await request.body()
    try:
        import stripe as stripe_lib
        stripe_lib.api_key = STRIPE_SECRET_KEY
        event = stripe_lib.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    db = next(get_db())
    try:
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            booking_id = int(session["metadata"]["booking_id"])
            booking = db.query(models.Booking).filter(
                models.Booking.id == booking_id
            ).first()
            if booking:
                booking.status = "confirmed"
                payment = db.query(models.Payment).filter(
                    models.Payment.stripe_session_id == session["id"]
                ).first()
                if payment:
                    payment.status = "completed"
                    payment.stripe_payment_intent = session.get("payment_intent")
                create_notification(
                    db, booking.user_id,
                    "Payment Confirmed",
                    f"Payment for booking {booking.booking_ref} confirmed!",
                    "payment"
                )
                db.commit()
    finally:
        db.close()

    return {"status": "ok"}


@router.get("/booking/{booking_id}", response_model=schemas.PaymentOut)
def get_payment_for_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    payment = db.query(models.Payment).filter(
        models.Payment.booking_id == booking_id
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="No payment record found")
    return payment
