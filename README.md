#  Event Booking & Ticketing Platform

A full-stack event booking system built with **FastAPI + React**.

---

## 🗂 Project Structure

```
eventbooking/
├── backend/          ← FastAPI + SQLite
└── frontend/         ← React + Vite
```

---
## Demo videos
frontend demo video:https://drive.google.com/file/d/179YJzcdnKS5jFqgGfMnoIWc4lMVWGrQJ/view?usp=sharing

backend demo video:https://drive.google.com/file/d/16vJQN_P2gjQhfapKhnKLLIWH4iXgLumU/view?usp=sharing
##  Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

---

### Step 1 — Start the Backend

**Mac / Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at: **http://localhost:8000**  
API Docs (Swagger): **http://localhost:8000/docs**

---

### Step 2 — Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

##  Demo Credentials (Auto-seeded)

| Role  | Email                      | Password  |
|-------|----------------------------|-----------|
| Admin | admin@eventbooking.com     | admin123  |
| User  | user@eventbooking.com      | user123   |

---

##  All API Endpoints

### Auth
| Method | Endpoint         | Description        | Auth     |
|--------|------------------|--------------------|----------|
| POST   | /auth/register   | Register user      | Public   |
| POST   | /auth/login      | Login              | Public   |
| GET    | /auth/me         | Get current user   | Required |

### Events
| Method | Endpoint         | Description            | Auth     |
|--------|------------------|------------------------|----------|
| GET    | /events          | List events (browsing) | Public   |
| GET    | /events/{id}     | Event detail           | Public   |
| POST   | /events          | Create event           | Admin    |
| PUT    | /events/{id}     | Update event           | Admin    |
| DELETE | /events/{id}     | Delete event           | Admin    |
| GET    | /events/all      | All events (admin)     | Admin    |

### Bookings
| Method | Endpoint                 | Description       | Auth     |
|--------|--------------------------|-------------------|----------|
| POST   | /bookings                | Create booking    | User     |
| GET    | /bookings                | All bookings      | Admin    |
| GET    | /bookings/my             | My bookings       | User     |
| GET    | /bookings/{id}           | Booking detail    | User     |
| POST   | /bookings/{id}/cancel    | Cancel booking    | User     |

### Payments
| Method | Endpoint                      | Description           | Auth  |
|--------|-------------------------------|-----------------------|-------|
| POST   | /payments/create-session      | Create checkout       | User  |
| POST   | /payments/webhook             | Stripe webhook        | -     |
| GET    | /payments/booking/{id}        | Payment for booking   | User  |

### Admin Analytics
| Method | Endpoint                    | Description          | Auth  |
|--------|-----------------------------|----------------------|-------|
| GET    | /admin/analytics/events     | Per-event stats      | Admin |
| GET    | /admin/analytics/revenue    | Revenue overview     | Admin |
| GET    | /admin/users                | All users            | Admin |

### Notifications
| Method | Endpoint                        | Description         | Auth |
|--------|---------------------------------|---------------------|------|
| GET    | /notifications                  | Get notifications   | User |
| POST   | /notifications/{id}/read        | Mark one read       | User |
| POST   | /notifications/read-all         | Mark all read       | User |

---

## 💳 Payment Integration

### Demo Mode (Default)
When no Stripe key is configured, payments are **auto-confirmed instantly** for testing.

### Real Stripe (Optional)
1. Create a Stripe account at https://stripe.com
2. Get your test keys from the Stripe Dashboard
3. Edit `backend/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_your_actual_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

---

##  Security Features
- JWT authentication with 24-hour token expiry
- Bcrypt password hashing
- Role-based access control (Admin / User)
- Database row locking to prevent overbooking race conditions
- Admin registration restricted (first admin only)

---

##  Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Backend  | FastAPI, SQLAlchemy     |
| Database | SQLite (dev-ready)      |
| Auth     | JWT (python-jose)       |
| Password | Bcrypt (passlib)        |
| Payment  | Stripe (+ mock mode)    |
| Frontend | React 18, Vite          |
| Routing  | React Router v6         |
| HTTP     | Axios                   |
| Toasts   | react-hot-toast         |
| Fonts    | Syne + DM Sans          |

---

## 📁 Opening in VS Code

```bash
# From the project root
code eventbooking
```

Recommended VS Code extensions:
- Python (ms-python.python)
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- REST Client (for testing APIs)

---

##  Troubleshooting

**"Module not found" (Python)**  
Make sure your virtual environment is activated: `source venv/bin/activate`

**"Port already in use"**  
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9   # Mac/Linux
netstat -ano | findstr :8000    # Windows (then taskkill /PID <pid> /F)
```

**CORS errors in browser**  
The backend allows `localhost:5173` and `localhost:3000` by default. Ensure frontend runs on one of these ports.

**Database reset**  
Delete `backend/eventbooking.db` and restart the backend — it will re-seed automatically.
