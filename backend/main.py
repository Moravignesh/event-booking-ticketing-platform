from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
import models
from routers import auth, events, bookings, payments, admin, notifications
from auth import get_password_hash
from datetime import datetime, timedelta

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Event Booking & Ticketing API",
    description="A full-featured event booking and ticketing platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(notifications.router)


# ─── Seed Database ───────────────────────────────────────────────────────────────

def seed_database():
    db = SessionLocal()
    try:
        if db.query(models.User).count() > 0:
            return

        # Create admin user
        admin_user = models.User(
            email="admin@eventbooking.com",
            name="Admin User",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin_user)

        # Create test user
        test_user = models.User(
            email="user@eventbooking.com",
            name="Test User",
            hashed_password=get_password_hash("user123"),
            role="user"
        )
        db.add(test_user)
        db.flush()

        # Sample events
        events_data = [
            {
                "title": "Tech Summit 2025",
                "description": "Join the most exciting technology conference featuring industry leaders, workshops, and networking opportunities. Topics include AI, Web3, Cloud Computing, and more.",
                "date": datetime.now() + timedelta(days=15),
                "location": "Hyderabad International Convention Centre",
                "total_tickets": 500,
                "available_tickets": 500,
                "price": 2999.0,
                "image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
                "category": "Technology",
                "created_by": admin_user.id
            },
            {
                "title": "Carnatic Music Festival",
                "description": "A three-day celebration of classical Carnatic music featuring renowned artists from across India. Experience the richness of traditional ragas and compositions.",
                "date": datetime.now() + timedelta(days=22),
                "location": "Ravindra Bharathi, Hyderabad",
                "total_tickets": 800,
                "available_tickets": 800,
                "price": 999.0,
                "image_url": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800",
                "category": "Music",
                "created_by": admin_user.id
            },
            {
                "title": "Startup Pitch Night",
                "description": "Watch 20 promising startups pitch their ideas to top venture capitalists. Network with founders, investors, and innovators shaping the future.",
                "date": datetime.now() + timedelta(days=8),
                "location": "T-Hub, Hyderabad",
                "total_tickets": 200,
                "available_tickets": 200,
                "price": 499.0,
                "image_url": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800",
                "category": "Business",
                "created_by": admin_user.id
            },
            {
                "title": "IPL Watch Party - RCB vs MI",
                "description": "Watch the biggest IPL rivalry live on giant screens with fellow cricket fans. Food, drinks, and unlimited entertainment guaranteed!",
                "date": datetime.now() + timedelta(days=5),
                "location": "Sports Bar, Jubilee Hills",
                "total_tickets": 150,
                "available_tickets": 150,
                "price": 799.0,
                "image_url": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
                "category": "Sports",
                "created_by": admin_user.id
            },
            {
                "title": "Yoga & Wellness Retreat",
                "description": "A full-day immersive retreat covering yoga, meditation, pranayama, and nutrition workshops. Rejuvenate your mind, body, and soul.",
                "date": datetime.now() + timedelta(days=30),
                "location": "Shilparamam, Hyderabad",
                "total_tickets": 100,
                "available_tickets": 100,
                "price": 1499.0,
                "image_url": "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800",
                "category": "Wellness",
                "created_by": admin_user.id
            },
            {
                "title": "EDM Night - Sunburn Arena",
                "description": "Dance the night away with world-class DJs. Featuring international artists and state-of-the-art sound and light systems.",
                "date": datetime.now() + timedelta(days=12),
                "location": "GMR Arena, Hyderabad",
                "total_tickets": 2000,
                "available_tickets": 2000,
                "price": 1999.0,
                "image_url": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
                "category": "Music",
                "created_by": admin_user.id
            },
        ]

        for ed in events_data:
            ev = models.Event(**ed)
            db.add(ev)

        db.commit()
        print("✅ Database seeded with demo data")
        print("📧 Admin: admin@eventbooking.com | Password: admin123")
        print("📧 User: user@eventbooking.com | Password: user123")

    except Exception as e:
        print(f"Seed error: {e}")
        db.rollback()
    finally:
        db.close()


@app.on_event("startup")
def startup_event():
    seed_database()


@app.get("/")
def root():
    return {
        "message": "Event Booking API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
