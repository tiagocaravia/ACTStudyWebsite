# ACT Study Website - Full Setup & Running Guide

## Overview

This is a full-stack web application for ACT test preparation with:
- **Frontend**: React TypeScript with responsive UI
- **Backend**: FastAPI with SQLAlchemy ORM
- **Database**: SQLite (local dev) / PostgreSQL (production)
- **Auth**: JWT tokens with password hashing

The homepage emphasizes that **Ivy League and top universities require ACT/SAT scores**, making test prep critical for college admission.

---

## 🚀 Quick Start (5 minutes)

### Terminal 1: Start the Backend API

```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Terminal 2: Start the Frontend

```bash
cd frontend
npm start
```

The browser will open at `http://localhost:3000` automatically.

---

## ✅ Testing the Auth Flow

Once both servers are running, test the complete signup → login → access restricted pages flow:

### Option A: Using the Web UI (Easiest)

1. Go to `http://localhost:3000`
2. Click "Sign Up" button
3. Fill in:
   - Email: `testuser@example.com`
   - Full Name: `Test User`
   - Username: `testuser123`
   - Password: `TestPassword123`
4. Click "Sign Up"
5. You should be **redirected to `/questions` page**
6. Log out and test the login page

### Option B: Using curl (Terminal)

```bash
# Sign up
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123",
    "full_name": "Test User",
    "username": "testuser123"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "password": "TestPassword123"
  }'

# Get authenticated user (replace TOKEN with access_token from login)
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Option C: Using the Test Script

```bash
chmod +x test_auth_flow.sh
./test_auth_flow.sh
```

---

## 📁 Project Structure

```
ACTStudyWebsite/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & startup
│   │   ├── local_db.py          # SQLite dev database
│   │   ├── schemas.py           # Pydantic models
│   │   ├── routes/
│   │   │   └── auth.py          # Register, login, me endpoints
│   │   ├── auth/
│   │   │   └── jwt_handler.py   # JWT & password hashing
│   │   └── models/
│   │       └── user.py          # User SQLAlchemy model
│   ├── requirements.txt
│   └── app.db                   # SQLite (created on startup)
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Routing setup
│   │   ├── pages/
│   │   │   ├── HomePage.tsx     # Landing with Ivy League info
│   │   │   ├── SignUpPage.tsx   # Registration
│   │   │   ├── LoginPage.tsx    # Login
│   │   │   └── QuestionsPage.tsx # ACT questions
│   │   └── context/
│   │       └── AuthContext.tsx  # State management
│   ├── .env                     # API URL config
│   └── package.json
│
├── BACKEND_SETUP.md
├── test_auth_flow.sh
└── README.md (this file)
```

---

## ✨ What's Working

✅ **Backend**
- User registration (email, username, password, full name)
- Password hashing (PBKDF2-SHA256)
- JWT token generation (30-day expiry)
- User login
- Authenticated endpoints with Bearer tokens
- SQLite database with auto table creation
- CORS configured

✅ **Frontend**
- Signup form with validation
- Login form with validation
- Homepage with Ivy League test score messaging
- Protected routes (requires authentication)
- Token persistence in localStorage
- Automatic redirect after signup
- Error handling

---

## 🎯 Key Features

### Homepage
- **Message**: "Your ACT Score Determines Your College Options"
- **Focus**: All 8 Ivy League schools require/recommend test scores
- **Stats**: 34-35 average ACT at top schools, scholarships tied to scores
- **CTA**: Direct links to sign up

### Authentication
- Signup with email, username, password, full name
- Login with username and password
- JWT tokens valid for 30 days
- Secure password hashing
- Protected endpoints

---

## 🔧 Configuration

### Backend (.env in root)
```env
SECRET_KEY=your-secret-key-change-in-production
```

### Frontend (.env in frontend/)
```env
REACT_APP_API_URL=http://localhost:8000/api
```

---

## 💾 Database

**Development**: SQLite at `backend/app.db`
- Automatically created on startup
- Reset: Delete `app.db` and restart backend

**Users Table**:
```sql
id (Primary Key)
email (Unique)
username (Unique)
full_name
hashed_password
created_at
updated_at
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version (need 3.13+)
python --version

# Reinstall dependencies
pip install -r backend/requirements.txt

# Try different port if 8000 is busy
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

### Frontend won't start
```bash
# Check Node version (need 16+)
node --version

# Clear and reinstall
rm -rf frontend/node_modules
npm install --prefix frontend
npm start --prefix frontend
```

### Signup not working
- Verify backend running: `curl http://localhost:8000/api/auth/register -X OPTIONS`
- Check frontend `.env`: `REACT_APP_API_URL=http://localhost:8000/api`
- Browser console (F12) for errors
- Backend logs for error messages

### Reset everything
```bash
# Clear database
rm backend/app.db

# Restart both servers
# Terminal 1:
cd backend && python -m uvicorn app.main:app --reload

# Terminal 2:
cd frontend && npm start
```

---

## 📚 Next Steps

1. **Add Questions**: Populate database with ACT practice questions
2. **Analytics**: Track student progress and performance
3. **AI Feedback**: Integrate OpenAI for personalized feedback
4. **Production**: Deploy to Render, Vercel, or similar
5. **Database**: Migrate to PostgreSQL/Supabase

---

**Status**: Auth system complete and tested ✨
