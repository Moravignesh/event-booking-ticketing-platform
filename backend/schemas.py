from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ─── Auth Schemas ───────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: str
    name: str
    password: str
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ─── Event Schemas ───────────────────────────────────────────────────────────────

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    date: datetime
    location: str
    total_tickets: int
    price: float
    image_url: Optional[str] = ""
    category: Optional[str] = "General"

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    total_tickets: Optional[int] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class EventOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    date: datetime
    location: str
    total_tickets: int
    available_tickets: int
    price: float
    image_url: Optional[str]
    category: Optional[str]
    is_active: bool
    created_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Booking Schemas ─────────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    event_id: int
    quantity: int = 1

class BookingOut(BaseModel):
    id: int
    user_id: int
    event_id: int
    quantity: int
    total_amount: float
    status: str
    booking_ref: str
    created_at: datetime
    event: Optional[EventOut] = None
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True


# ─── Payment Schemas ─────────────────────────────────────────────────────────────

class PaymentCreate(BaseModel):
    booking_id: int

class PaymentOut(BaseModel):
    id: int
    booking_id: int
    amount: float
    status: str
    stripe_session_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class CheckoutSession(BaseModel):
    checkout_url: str
    session_id: str
    booking_id: int


# ─── Notification Schemas ────────────────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    notification_type: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Analytics Schemas ───────────────────────────────────────────────────────────

class EventAnalytics(BaseModel):
    event_id: int
    title: str
    total_bookings: int
    confirmed_bookings: int
    cancelled_bookings: int
    tickets_sold: int
    revenue: float
    available_tickets: int
    total_tickets: int

class RevenueAnalytics(BaseModel):
    total_revenue: float
    confirmed_revenue: float
    pending_revenue: float
    total_bookings: int
    confirmed_bookings: int
    cancelled_bookings: int
    total_events: int
    active_events: int
    monthly_revenue: List[dict]
